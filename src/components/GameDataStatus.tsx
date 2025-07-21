// src/components/GameDataStatus.tsx
'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { apiService } from '@/lib/api';

interface GameDataHealth {
  initialized: boolean;
  cacheStats: {
    skins: boolean;
    bundles: boolean;
    version: boolean;
  };
}

export default function GameDataStatus() {
  const { data: healthData, loading, execute } = useApi<GameDataHealth>();
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkHealth = () => {
      execute(() => apiService.getGameDataHealth());
      setLastCheck(new Date());
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [execute]);

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-400' : 'text-red-400';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? '✓' : '✗';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Game Data Status</h3>
        <button
          onClick={() => execute(() => apiService.getGameDataHealth())}
          disabled={loading}
          className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition duration-200"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {healthData && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Service Initialized</span>
            <span className={getStatusColor(healthData.initialized)}>
              {getStatusIcon(healthData.initialized)} {healthData.initialized ? 'Ready' : 'Loading'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Skins Cache</span>
            <span className={getStatusColor(healthData.cacheStats.skins)}>
              {getStatusIcon(healthData.cacheStats.skins)} {healthData.cacheStats.skins ? 'Loaded' : 'Empty'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Bundles Cache</span>
            <span className={getStatusColor(healthData.cacheStats.bundles)}>
              {getStatusIcon(healthData.cacheStats.bundles)} {healthData.cacheStats.bundles ? 'Loaded' : 'Empty'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Version Cache</span>
            <span className={getStatusColor(healthData.cacheStats.version)}>
              {getStatusIcon(healthData.cacheStats.version)} {healthData.cacheStats.version ? 'Loaded' : 'Empty'}
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          Last checked: {lastCheck.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}