'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
          🗳️
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Student Election Portal</h1>
        <p className="text-slate-600 text-sm mb-8">
          Welcome to the digital ballot! Cast your vote securely in under a minute.
        </p>

        <div className="space-y-3">
          <Link
            href="/vote"
            className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
          >
            Enter Voting Portal
          </Link>
          <Link
            href="/admin"
            className="block w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition text-sm"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
