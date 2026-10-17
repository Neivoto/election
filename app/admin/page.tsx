'use client';

import React, { useState, useEffect } from 'react';

type Candidate = { id: string; name: string; votes: number };
type Position = { id: string; title: string; candidates: Candidate[] };

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [electionStatus, setElectionStatus] = useState<'active' | 'paused' | 'ended'>('active');
  const [newPositionTitle, setNewPositionTitle] = useState('');
  const [selectedPosId, setSelectedPosId] = useState('');
  const [newCandidateName, setNewCandidateName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchElectionData();
    }
  }, [isAuthenticated]);

  const fetchElectionData = async () => {
    try {
      const res = await fetch('/api/election');
      const data = await res.json();
      setPositions(data.positions || []);
      setElectionStatus(data.electionStatus || 'active');
    } catch (err) {
      console.error('Failed to load election data');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') { // Or your custom password
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPositionTitle.trim()) return;

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      title: newPositionTitle.trim(),
      candidates: [],
    };

    const updatedPositions = [...positions, newPos];
    await savePositionsToKV(updatedPositions);
    setNewPositionTitle('');
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosId || !newCandidateName.trim()) return;

    const updatedPositions = positions.map((pos) => {
      if (pos.id === selectedPosId) {
        return {
          ...pos,
          candidates: [
            ...pos.candidates,
            { id: `cand-${Date.now()}`, name: newCandidateName.trim(), votes: 0 },
          ],
        };
      }
      return pos;
    });

    await savePositionsToKV(updatedPositions);
    setNewCandidateName('');
  };

  const handleResetElection = async () => {
    if (confirm('Are you sure you want to delete ALL positions and reset the election?')) {
      await savePositionsToKV([]);
    }
  };

  const savePositionsToKV = async (newPositions: Position[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positions: newPositions,
          electionStatus,
        }),
      });

      if (res.ok) {
        setPositions(newPositions);
      } else {
        alert('Failed to update election data.');
      }
    } catch (err) {
      alert('Error saving data.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
          <h1 className="text-xl font-bold text-slate-800 mb-4 text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  const totalVotesAcrossAll = positions.reduce(
    (acc, pos) => acc + pos.candidates.reduce((cAcc, c) => cAcc + c.votes, 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Election Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage positions, candidates, and live results</p>
        </div>
        <button
          onClick={handleResetElection}
          className="bg-red-50 text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-100 transition"
        >
          Reset All Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Add Position Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-lg text-slate-800 mb-4">1. Add Position</h2>
          <form onSubmit={handleAddPosition} className="space-y-4">
            <input
              type="text"
              placeholder="e.g. President"
              value={newPositionTitle}
              onChange={(e) => setNewPositionTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition disabled:bg-slate-300"
            >
              Add Position
            </button>
          </form>
        </div>

        {/* Add Candidate Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-lg text-slate-800 mb-4">2. Add Candidate</h2>
          <form onSubmit={handleAddCandidate} className="space-y-4">
            <select
              value={selectedPosId}
              onChange={(e) => setSelectedPosId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">Select Position</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.title}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Candidate Name"
              value={newCandidateName}
              onChange={(e) => setNewCandidateName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={loading || !selectedPosId}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition disabled:bg-slate-300"
            >
              Add Candidate
            </button>
          </form>
        </div>
      </div>

      {/* Results / Candidates Overview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-xl text-slate-800 mb-6">Live Election Results</h2>

        {positions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No positions created yet. Add a position above to get started!
          </div>
        ) : (
          positions.map((pos) => {
            const posTotalVotes = pos.candidates.reduce((acc, c) => acc + c.votes, 0);

            return (
              <div key={pos.id} className="mb-8 last:mb-0">
                <h3 className="font-bold text-lg text-slate-700 mb-3">{pos.title}</h3>
                {pos.candidates.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No candidates added to this position yet.</p>
                ) : (
                  <div className="space-y-3">
                    {pos.candidates.map((candidate) => {
                      const percentage = posTotalVotes > 0 ? Math.round((candidate.votes / posTotalVotes) * 100) : 0;
                      return (
                        <div key={candidate.id} className="bg-slate-50 p-4 rounded-xl">
                          <div className="flex justify-between text-sm font-semibold text-slate-800 mb-1">
                            <span>{candidate.name}</span>
                            <span>{candidate.votes} votes ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}