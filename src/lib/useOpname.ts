import { useState, useEffect } from 'react';

/**
 * Hook om opname ID te beheren in sessionStorage
 * Dit zorgt ervoor dat de opname ID beschikbaar is tijdens de hele sessie
 */
export function useOpnameId() {
  const [opnameId, setOpnameIdState] = useState<string | null>(null);

  useEffect(() => {
    // Laad opname ID uit sessionStorage
    const stored = sessionStorage.getItem('currentOpnameId');
    if (stored) {
      setOpnameIdState(stored);
    }
  }, []);

  const setOpnameId = (id: string | null) => {
    if (id) {
      sessionStorage.setItem('currentOpnameId', id);
      setOpnameIdState(id);
    } else {
      sessionStorage.removeItem('currentOpnameId');
      setOpnameIdState(null);
    }
  };

  return [opnameId, setOpnameId] as const;
}

