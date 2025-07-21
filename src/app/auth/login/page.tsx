// src/app/auth/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';

export default function LoginPage() {
  const [authUrl, setAuthUrl] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const generateAuthUrl = async () => {
    try {
      setLoading(true);
      const response = await apiService.generateAuthUrl();
      
      if (response.success && response.data) {
        setAuthUrl(response.data.authUrl);
      } else {
        setError('Failed to generate auth URL');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!callbackUrl.trim()) {
      setError('Please enter callback URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const success = await login(callbackUrl);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Login failed. Please check your callback URL.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const simulateCallback = () => {
    const dummyCallback = `https://playvalorant.com/opt_in#access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkdW1teS11c2VyLWlkIiwiYWNjdCI6eyJnYW1lX25hbWUiOiJUZXN0VXNlciIsInRhZ19saW5lIjoiVEVTVCIsInJlZ2lvbiI6ImFwIn0sImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxNjQwOTk4ODAwfQ.dummy-signature&id_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkdW1teS11c2VyLWlkIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTg4MDB9.dummy-signature&token_type=Bearer`;
    setCallbackUrl(dummyCallback);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Valorant Store</h2>
          <p className="mt-2 text-gray-400">OAuth Login - No Password Required</p>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Step 1: Generate Auth URL */}
          <div className="space-y-3">
            <button
              onClick={generateAuthUrl}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
            >
              {loading ? 'Generating...' : '1. Generate Auth URL'}
            </button>
            
            {authUrl && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={authUrl}
                  readOnly
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 text-sm"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(authUrl, '_blank')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm"
                  >
                    Open in New Tab
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(authUrl)}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Open this URL, complete Riot login, then copy the final redirect URL below
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Enter Callback URL */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              2. Callback URL (after Riot login):
            </label>
            <textarea
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
              placeholder="https://playvalorant.com/opt_in#access_token=..."
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 resize-none"
              rows={4}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleLogin}
                disabled={loading || !callbackUrl.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <button
                onClick={simulateCallback}
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg text-sm"
              >
                Demo
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Secure OAuth flow - Your credentials stay with Riot</p>
        </div>
      </div>
    </div>
  );
}