'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const sections = [
  { id: 'algemeen', name: 'Algemeen', path: '/opnamen/algemeen', storageKey: 'algemeen' },
  { id: 'verwarmingssysteem', name: 'Verwarming\nSysteem', path: '/opnamen/verwarmingssysteem', storageKey: 'verwarmingssysteem' },
  { id: 'warm-tapwater', name: 'Warm\nTapwater', path: '/opnamen/warm-tapwater', storageKey: 'warmTapwater' },
  { id: 'ventilatie', name: 'Ventilatie', path: '/opnamen/ventilatie', storageKey: 'ventilatie' },
  { id: 'verlichting', name: 'Verlichting', path: '/opnamen/verlichting', storageKey: 'verlichting' },
  { id: 'airconditioning', name: 'Koeling\nSysteem', path: '/opnamen/airconditioning', storageKey: 'airconditioning' },
  { id: 'gebouwmanagement', name: 'Gebouw\nManagement', path: '/opnamen/gebouwmanagement', storageKey: 'gebouwmanagement' },
  { id: 'zonwering', name: 'Zonwering', path: '/opnamen/zonwering', storageKey: 'zonwering' },
  { id: 'voltooid', name: 'Voltooid', path: '/opnamen/voltooid', storageKey: 'voltooid' }
];

export default function TimelineNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  useEffect(() => {
    // Check which sections are completed
    const opnamenData = localStorage.getItem('gacsOpnamenData');
    const buildingData = localStorage.getItem('gacsBuildingData');
    
    // Only show completed sections if we have both building data and opnamen data
    if (opnamenData && buildingData) {
      const data = JSON.parse(opnamenData);
      
      const completed = Object.keys(data).filter(key => {
        const sectionData = data[key];
        // Mark as completed if section has any data at all
        return sectionData && 
               typeof sectionData === 'object' && 
               Object.keys(sectionData).length > 0;
      });
      
      setCompletedSections(completed);
    } else {
      setCompletedSections([]);
    }
  }, [pathname]);

  const handleSectionClick = (path: string, sectionId: string) => {
    // Special handling for voltooid section
    if (sectionId === 'voltooid') {
      // Only allow navigation to voltooid if all other sections are completed
      const allSectionsCompleted = sections.slice(0, -1).every(section => 
        completedSections.includes(section.storageKey)
      );
      
      if (!allSectionsCompleted) {
        return;
      }
    }
    
    router.push(path);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Voortgang</h3>
      <div className="relative">
        {/* Horizontal timeline line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300"></div>
        
        <div className="flex justify-between items-start relative">
          {sections.map((section, index) => {
            const isCompleted = completedSections.includes(section.storageKey);
            const isActive = pathname === section.path;
            // Allow navigation to any completed section or the next available section
            const isAccessible = index === 0 || 
                               completedSections.includes(sections[index - 1]?.storageKey) || 
                               completedSections.includes(section.storageKey);
            
            // Special case for voltooid - only accessible if all sections are completed
            const isVoltooidAccessible = section.id === 'voltooid' ? 
              sections.slice(0, -1).every(s => completedSections.includes(s.storageKey)) : 
              true;
            

            
            return (
              <div key={section.id} className="flex flex-col items-center">
                {/* Timeline dot - Clickable */}
                <button
                  onClick={() => handleSectionClick(section.path, section.id)}
                  disabled={!isAccessible || !isVoltooidAccessible}
                  className={`relative w-8 h-8 rounded-full border-2 mb-2 flex items-center justify-center transform -translate-y-0.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#c7d316] border-[#c7d316] cursor-default'
                      : isCompleted
                      ? 'bg-[#c7d316] border-[#c7d316] hover:bg-[#b3c014] hover:border-[#b3c014] cursor-pointer'
                      : isAccessible
                      ? 'bg-white border-gray-400 hover:bg-gray-50 hover:border-gray-500 cursor-pointer'
                      : 'bg-gray-200 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-[#343234] text-xs">✓</span>
                  ) : (
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-[#343234]' : isAccessible ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </button>
                
                {/* Section button */}
                <button
                  onClick={() => handleSectionClick(section.path, section.id)}
                  disabled={!isAccessible || !isVoltooidAccessible}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 text-center max-w-20 whitespace-pre-line leading-tight ${
                    isActive
                      ? 'bg-[#c7d316] text-[#343234]'
                      : isCompleted
                      ? 'bg-[#c7d316]/20 text-[#343234] hover:bg-[#c7d316]/30'
                      : isAccessible
                      ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {section.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 