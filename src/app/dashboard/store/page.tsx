// src/app/dashboard/store/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import DailyStore from '@/components/DailyStore';
import GameDataStatus from '@/components/GameDataStatus';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-white">Daily Store</h1>
            </div>
            <div className="text-sm text-gray-400">
              Welcome, {user.gameName}#{user.tagLine}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Store Content */}
          <div className="lg:col-span-3">
            <DailyStore />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GameDataStatus />
            
            {/* Quick Stats */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Your Balance</h3>
              {user.balance && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">VP</span>
                    <span className="text-yellow-400 font-mono">
                      {user.balance.valorantPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">RP</span>
                    <span className="text-green-400 font-mono">
                      {user.balance.radianitePoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">KC</span>
                    <span className="text-blue-400 font-mono">
                      {user.balance.kingdomCredits.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}