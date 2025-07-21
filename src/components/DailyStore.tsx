// src/components/DailyStore.tsx
'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { apiService } from '@/lib/api';

interface StoreSkin {
  id: string;
  displayName: string;
  displayIcon: string;
  cost: {
    [currencyId: string]: number;
  };
}

interface StoreData {
  skins: StoreSkin[];
  refreshTime: string;
  expires: string;
}

export default function DailyStore() {
  const { data: storeData, loading, error, execute } = useApi<StoreData>();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    execute(() => apiService.getDailyStore());
  }, [execute]);

  useEffect(() => {
    if (storeData?.expires) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(storeData.expires).getTime();
        const distance = expiry - now;

        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Expired');
          execute(() => apiService.getDailyStore());
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [storeData?.expires, execute]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg p-4">
                <div className="h-32 bg-gray-600 rounded mb-4"></div>
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="text-center text-red-400">
          <p>Failed to load daily store</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => execute(() => apiService.getDailyStore())}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Daily Store</h2>
        <div className="text-right">
          <div className="text-sm text-gray-400">Refreshes in</div>
          <div className="text-lg font-mono text-red-400">{timeLeft}</div>
        </div>
      </div>

      {storeData?.skins ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {storeData.skins.map((skin) => (
            <div key={skin.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition duration-200">
              <div className="aspect-square bg-gray-600 rounded-lg mb-4 overflow-hidden">
                {skin.displayIcon ? (
                  <img
                    src={skin.displayIcon}
                    alt={skin.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              
              <h3 className="font-medium text-white mb-2 text-sm">{skin.displayName}</h3>
              
              <div className="space-y-1">
                {Object.entries(skin.cost || {}).map(([currencyId, amount]) => (
                  <div key={currencyId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {currencyId.includes('85ad13f7') ? 'VP' : 
                       currencyId.includes('e59aa87c') ? 'RP' : 'KC'}
                    </span>
                    <span className="text-yellow-400 font-mono">{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <p>No store data available</p>
        </div>
      )}
    </div>
  );
}