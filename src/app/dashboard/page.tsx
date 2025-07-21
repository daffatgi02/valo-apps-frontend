// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';

interface ActiveSession {
  username: string;
  gameName: string;
  tagLine: string;
  lastActivity: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, logout, refreshProfile, switchAccount, loading } = useAuth();
  const [activeSessions, setActiveSessions] = useState<Record<string, ActiveSession>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadActiveSessions();
    }
  }, [user]);

  const loadActiveSessions = async () => {
    try {
      const response = await apiService.getAllSessions();
      if (response.success && response.data) {
        setActiveSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
      await loadActiveSessions();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSwitchAccount = async (userId: string) => {
    setSwitching(userId);
    try {
      const success = await switchAccount(userId);
      if (success) {
        await loadActiveSessions();
      }
    } catch (error) {
      console.error('Switch failed:', error);
    } finally {
      setSwitching(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

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
              <h1 className="text-2xl font-bold text-white">Valorant Store</h1>
              <span className="px-3 py-1 bg-green-600 text-xs rounded-full">Online</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Session */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Current Session</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user.gameName?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{user.username}</h3>
                    <p className="text-gray-400">{user.gameName}#{user.tagLine}</p>
                    <p className="text-sm text-gray-500">Region: {user.region}</p>
                  </div>
                </div>

                {user.balance && (
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {user.balance.valorantPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Valorant Points</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {user.balance.radianitePoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Radianite Points</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {user.balance.kingdomCredits.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Kingdom Credits</div>
                    </div>
                  </div>
                )}

                {user.accountXP && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Account Level</span>
                      <span className="text-xl font-bold text-purple-400">{user.accountXP.level}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>XP: {user.accountXP.xp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-center transition duration-200">
                  <div className="text-2xl mb-2">🏪</div>
                  <div className="text-sm text-white">Daily Store</div>
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-center transition duration-200">
                  <div className="text-2xl mb-2">📦</div>
                  <div className="text-sm text-white">Bundles</div>
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-center transition duration-200">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-sm text-white">Skins</div>
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-center transition duration-200">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm text-white">History</div>
                </button>
              </div>
            </div>
          </div>

          {/* Active Accounts */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Active Accounts</h2>
              <div className="space-y-3">
                {Object.entries(activeSessions).map(([userId, session]) => (
                  <div
                    key={userId}
                    className={`p-4 rounded-lg border transition duration-200 cursor-pointer ${
                      userId === user.id
                        ? 'bg-red-600 bg-opacity-20 border-red-500'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                    onClick={() => userId !== user.id && handleSwitchAccount(userId)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{session.username}</div>
                        <div className="text-sm text-gray-400">
                          Last: {new Date(session.lastActivity).toLocaleTimeString()}
                        </div>
                      </div>
                      {userId === user.id ? (
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Current</span>
                      ) : switching === userId ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <span className="text-gray-400">→</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">API Server</span>
                  <span className="text-green-400">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sessions</span>
                  <span className="text-white">{Object.keys(activeSessions).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Refresh</span>
                  <span className="text-gray-400 text-sm">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}