'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

// NavigationBar component doesn't need props

const sections = [
  { id: 'algemeen', name: 'Algemeen', path: '/opnamen/algemeen' },
  { id: 'verwarmingssysteem', name: 'Verwarmingssysteem', path: '/opnamen/verwarmingssysteem' },
  { id: 'warm-tapwater', name: 'Warm Tapwater', path: '/opnamen/warm-tapwater' },
  { id: 'ventilatie', name: 'Ventilatie', path: '/opnamen/ventilatie' },
  { id: 'verlichting', name: 'Verlichting', path: '/opnamen/verlichting' },
  { id: 'airconditioning', name: 'Airconditioning', path: '/opnamen/airconditioning' },
  { id: 'gebouwmanagement', name: 'Gebouwmanagement', path: '/opnamen/gebouwmanagement' },
  { id: 'zonwering', name: 'Zonwering', path: '/opnamen/zonwering' },
  { id: 'voltooid', name: 'Voltooid', path: '/opnamen/voltooid' }
];

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  useEffect(() => {
    // Check which sections are completed
    const opnamenData = localStorage.getItem('gacsOpnamenData');
    if (opnamenData) {
      const data = JSON.parse(opnamenData);
      const completed = Object.keys(data);
      setCompletedSections(completed);
    }
  }, [pathname]);

  const handleSectionClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#B7D840] rounded-full"></div>
            <span className="text-xl font-bold text-gray-800">GACS Platform</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {sections.map((section) => {
              const isCompleted = completedSections.includes(section.id);
              const isActive = pathname === section.path;
              
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : isCompleted
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{section.name}</span>
                    {isCompleted && (
                      <span className="text-green-600">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
} 