'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [electionStatus, setElectionStatus] = useState<'active' | 'paused' | 'ended'>('active');
  const [usedStudentIds, setUsedStudentIds] = useState<string[]>([]);
  
  // New Position / Candidate Form
  const [newPositionTitle, setNewPositionTitle] = useState('');
  const [newCandidateName, setNewCandidateName] = useState('');
  const [selectedPosForCandidate, setSelectedPosForCandidate] = useState('');

  const [shareableUrl, setShareableUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareableUrl(`${window.location.origin}/vote`);
    }
  }, []);

  const handleLogin = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setIsLoggedIn(true);
      fetchElectionData();
    } else {
      alert('Incorrect Password');
    }
  };

  const fetchElectionData = async () => {
    const res = await fetch('/api/election');
    const data = await res.json();
    setPositions(data.positions || []);
    setElectionStatus(data.electionStatus || 'active');
    setUsedStudentIds(data.usedStudentIds || []);
  };

  const handleAddPosition = async () => {
    if (!newPositionTitle) return;
    await fetch('/api/admin/position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newPositionTitle, password }),
    });
    setNewPositionTitle('');
    fetchElectionData();
  };

  const handleAddCandidate = async () => {
    if (!newCandidateName || !selectedPosForCandidate) return;
    await fetch('/api/admin/candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionId: selectedPosForCandidate, name: newCandidateName, password }),
    });
    setNewCandidateName('');
    fetchElectionData();
  };

  const handleStatusChange = async (status: string) => {
    await fetch('/api/admin/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, password }),
    });
    fetchElectionData();
  };

  const exportCSV = () => {
    let csv = 'Position,Candidate,Votes\n';
    positions.forEach((pos) => {
      pos.candidates.forEach((cand: any) => {
        csv += `"${pos.title}","${cand.name}",${cand.votes}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'election_results.csv';
    a.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 max-w-sm w-full">
          <h1 className="text-xl font-bold mb-4 text-slate-800">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl mb-4 text-sm"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Election Admin Panel</h1>
          <p className="text-xs text-slate-500">Total Voters Recorded: {usedStudentIds.length}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusChange('active')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
              electionStatus === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleStatusChange('paused')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
              electionStatus === 'paused' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Pause
          </button>
          <button
            onClick={() => handleStatusChange('ended')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
              electionStatus === 'ended' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            End
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* QR Code Section */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
          <h3 className="font-bold text-sm mb-4 text-slate-700">Voter Portal QR Code</h3>
          {shareableUrl && <QRCode value={shareableUrl} size={150} />}
          <p className="text-xs text-slate-400 mt-4 break-all">{shareableUrl}</p>
        </div>

        {/* Add Position */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-sm mb-4 text-slate-700">1. Add Position</h3>
          <input
            type="text"
            placeholder="e.g. President"
            value={newPositionTitle}
            onChange={(e) => setNewPositionTitle(e.target.value)}
            className="w-full p-2.5 border rounded-lg text-sm mb-3"
          />
          <button
            onClick={handleAddPosition}
            className="w-full bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-lg"
          >
            Add Position
          </button>
        </div>

        {/* Add Candidate */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-sm mb-4 text-slate-700">2. Add Candidate</h3>
          <select
            value={selectedPosForCandidate}
            onChange={(e) => setSelectedPosForCandidate(e.target.value)}
            className="w-full p-2.5 border rounded-lg text-sm mb-3"
          >
            <option value="">Select Position</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Candidate Name"
            value={newCandidateName}
            onChange={(e) => setNewCandidateName(e.target.value)}
            className="w-full p-2.5 border rounded-lg text-sm mb-3"
          />
          <button
            onClick={handleAddCandidate}
            className="w-full bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-lg"
          >
            Add Candidate
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800">Live Election Results</h3>
          <button
            onClick={exportCSV}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold"
          >
            Export CSV
          </button>
        </div>

        {positions.map((pos) => {
          const totalVotesForPos = pos.candidates.reduce((sum: number, c: any) => sum + (c.votes || 0), 0);

          return (
            <div key={pos.id} className="mb-6 pb-6 border-b last:border-0">
              <h4 className="font-semibold text-slate-700 mb-3">{pos.title}</h4>
              <div className="space-y-3">
                {pos.candidates.map((cand: any) => {
                  const pct = totalVotesForPos > 0 ? Math.round((cand.votes / totalVotesForPos) * 100) : 0;

                  return (
                    <div key={cand.id}>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>{cand.name}</span>
                        <span>
                          {cand.votes} votes ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
