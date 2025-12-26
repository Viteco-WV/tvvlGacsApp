'use client';

import { useState } from 'react';
import { migrateLocalStorageToDatabase, hasLocalStorageData } from '@/lib/migrate-localStorage';
import { useRouter } from 'next/navigation';

export default function MigrateLocalStorageButton() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const hasData = hasLocalStorageData();

  const handleMigrate = async () => {
    if (!hasData) {
      setMessage({ type: 'error', text: 'Geen data gevonden in localStorage' });
      return;
    }

    setIsMigrating(true);
    setMessage(null);

    try {
      const result = await migrateLocalStorageToDatabase('basis');

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Migratie succesvol! Opname ID: ${result.opnameId}`,
        });
        
        // Optioneel: redirect naar opname detail pagina
        if (result.opnameId) {
          setTimeout(() => {
            router.push(`/opnamen/${result.opnameId}`);
          }, 2000);
        }
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Fout bij migreren data',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Onbekende fout',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  if (!hasData) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-yellow-800">
            Data gevonden in localStorage
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            Er is data gevonden die naar de database gemigreerd kan worden.
          </p>
        </div>
        <button
          onClick={handleMigrate}
          disabled={isMigrating}
          className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isMigrating ? 'Migreren...' : 'Migreer naar database'}
        </button>
      </div>

      {message && (
        <div
          className={`mt-3 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

