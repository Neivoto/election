'use client';

import React, { useState, useEffect } from 'react';

type Candidate = { id: string; name: string };
type Position = { id: string; title: string; candidates: Candidate[] };

export default function VoterPortal() {
  const [studentId, setStudentId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [electionStatus, setElectionStatus] = useState<'active' | 'paused' | 'ended'>('active');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/election');
      const data = await res.json();
      if (data.positions) setPositions(data.positions);
      if (data.electionStatus) setElectionStatus(data.electionStatus);
    } catch (err) {
      console.error('Failed to load election data');
    } finally {
      setFetching(false);
    }
  };

  const handleSelect = (positionId: string, candidateId: string) => {
    setSelections((prev) => ({ ...prev, [positionId]: candidateId }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId.trim(), selections }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setIsSubmitted(true);
        setIsConfirmOpen(false);
      } else {
        setErrorMessage(data.error || 'Failed to submit vote.');
        setIsConfirmOpen(false);
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage('Network error. Please try again.');
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading ballot...
      </div>
    );
  }

  if (electionStatus === 'paused') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-sm w-full border">
          <div className="text-4xl mb-3">⏸️</div>
          <h2 className="text-xl font-bold text-slate-800">Voting Paused</h2>
          <p className="text-slate-500 text-sm mt-2">The election is currently paused by the admin.</p>
        </div>
      </div>
    );
  }

  if (electionStatus === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-sm w-full border">
          <div className="text-4xl mb-3">🏁</div>
          <h2 className="text-xl font-bold text-slate-800">Election Ended</h2>
          <p className="text-slate-500 text-sm mt-2">Voting has concluded. Thank you!</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-emerald-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-emerald-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Vote Recorded!</h2>
          <p className="text-slate-600 mt-2 text-sm">
            Thank you for participating! Your ballot has been securely submitted.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Student Identification</h1>
          <p className="text-sm text-slate-500 mb-6">Enter your Student ID to access your digital ballot.</p>

          {errorMessage && (
            <div className="p-3 mb-4 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100">
              {errorMessage}
            </div>
          )}

          <input
            type="text"
            placeholder="e.g. STU1024"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full p-3.5 border border-slate-200 rounded-xl mb-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-wider font-semibold"
          />
          <button
            onClick={() => {
              if (studentId.trim().length >= 3) {
                setErrorMessage('');
                setIsAuthenticated(true);
              } else {
                setErrorMessage('Please enter a valid Student ID.');
              }
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition shadow-md"
          >
            Access Ballot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28 max-w-md mx-auto">
      <header className="mb-6 pt-2">
        <span className="text-xs uppercase tracking-wider font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md">
          Official Ballot
        </span>
        <p className="text-xs text-slate-500 mt-2 font-mono">Voter ID: {studentId.toUpperCase()}</p>
      </header>

      {errorMessage && (
        <div className="p-4 mb-4 text-xs bg-red-50 text-red-600 rounded-xl border border-red-200">
          {errorMessage}
        </div>
      )}

      {positions.map((pos) => (
        <div key={pos.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 mb-5">
          <h2 className="font-bold text-lg text-slate-800 mb-4">{pos.title}</h2>
          <div className="space-y-3">
            {pos.candidates.map((candidate) => {
              const isSelected = selections[pos.id] === candidate.id;
              return (
                <div
                  key={candidate.id}
                  onClick={() => handleSelect(pos.id, candidate.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                      : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <span className="text-base">{candidate.name}</span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-center z-10">
        <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={Object.keys(selections).length < positions.length}
          className="w-full max-w-md bg-indigo-600 disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl shadow-lg transition"
        >
          Review & Submit Vote
        </button>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-xs w-full text-center shadow-2xl">
            <h3 className="font-bold text-xl text-slate-900 mb-2">Confirm Choices</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure? Once cast, your vote cannot be changed.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-md"
              >
                {loading ? 'Casting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
