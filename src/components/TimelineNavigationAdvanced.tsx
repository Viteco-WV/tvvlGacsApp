'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const sections = [
  { id: 'algemeen', name: 'Algemeen', path: '/opnamen-geavanceerd/algemeen', storageKey: 'algemeen' },
  { id: 'ruimtetypes', name: 'Ruimtetypes', path: '/opnamen-geavanceerd/ruimtetypes', storageKey: 'ruimtetypes' },
  { id: 'opwekking', name: 'Opwekking', path: '/opnamen-geavanceerd/opwekking', storageKey: 'opwekking' },
  { id: 'distributie', name: 'Distributie', path: '/opnamen-geavanceerd/distributie', storageKey: 'distributie' },
  { id: 'systeem', name: 'Systeem', path: '/opnamen-geavanceerd/systeem', storageKey: 'systeem' },
  { id: 'details', name: 'Details', path: '/opnamen-geavanceerd/details', storageKey: 'details' },
  { id: 'afronden', name: 'Afronden', path: '/opnamen-geavanceerd/afronden', storageKey: 'afronden' }
];

export default function TimelineNavigationAdvanced() {
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

  const handleSectionClick = (path: string) => {
    // Always allow navigation to voltooid page
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
            
            // Find the current section index
            const currentIndex = sections.findIndex(s => s.path === pathname);
            
            // Allow navigation to:
            // 1. Any section before the current one (already visited)
            // 2. Any completed section
            // 3. The next section after the last completed one
            const isAccessible = index < currentIndex || 
                               isCompleted || 
                               index === 0 || 
                               completedSections.includes(sections[index - 1]?.storageKey);
            
            return (
              <div key={section.id} className="flex flex-col items-center">
                {/* Timeline dot - Clickable */}
                <button
                  onClick={() => handleSectionClick(section.path)}
                  disabled={!isAccessible}
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
                  onClick={() => handleSectionClick(section.path)}
                  disabled={!isAccessible}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 text-center max-w-24 whitespace-pre-line leading-tight ${
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
