'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const sectionPaths = [
  { id: 'algemeen', name: 'Algemeen', pathSegment: 'algemeen', storageKey: 'algemeen' },
  { id: 'verwarmingssysteem', name: 'Verwarming\nSysteem', pathSegment: 'verwarmingssysteem', storageKey: 'verwarmingssysteem' },
  { id: 'warm-tapwater', name: 'Warm\nTapwater', pathSegment: 'warm-tapwater', storageKey: 'warmTapwater' },
  { id: 'airconditioning', name: 'Airconditioning\nSysteem', pathSegment: 'airconditioning', storageKey: 'airconditioning' },
  { id: 'ventilatie', name: 'Ventilatie\nSysteem', pathSegment: 'ventilatie', storageKey: 'ventilatie' },
  { id: 'verlichting', name: 'Verlichting\nSysteem', pathSegment: 'verlichting', storageKey: 'verlichting' },
  { id: 'zonwering', name: 'Zonwering\nSysteem', pathSegment: 'zonwering', storageKey: 'zonwering' },
  { id: 'gebouwmanagement', name: 'Gebouw\nManagement', pathSegment: 'gebouwmanagement', storageKey: 'gebouwmanagement' },
  { id: 'voltooid', name: 'Voltooid', pathSegment: 'voltooid', storageKey: 'voltooid' }
];

interface TimelineNavigationProps {
  onSave?: () => Promise<void> | void;
}

export default function TimelineNavigation({ onSave }: TimelineNavigationProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const opnameId = params?.id as string | undefined;
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Genereer sections met opnameId in path als die beschikbaar is
  const sections = sectionPaths.map(section => ({
    ...section,
    path: opnameId 
      ? (section.id === 'voltooid' ? `/opnamen/voltooid/${opnameId}` : `/opnamen/${opnameId}/${section.pathSegment}`)
      : (section.id === 'voltooid' ? '/opnamen/voltooid' : `/opnamen/${section.pathSegment}`)
  }));

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

  const handleSectionClick = async (path: string) => {
    // Als we al op deze pagina zijn, hoef je niet te navigeren
    if (pathname === path) {
      return;
    }
    
    // Sla data op voordat je navigeert (als onSave callback beschikbaar is)
    if (onSave) {
      try {
        await onSave();
      } catch (error) {
        console.error('Fout bij opslaan voordat navigeren:', error);
        // Ga door met navigeren, zelfs als opslaan faalt
      }
    }
    
    // Navigeer naar de gekozen sectie
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
            // Check if current path matches this section (with or without opnameId)
            const isActive = pathname === section.path || 
              (opnameId && pathname === `/opnamen/${opnameId}/${section.pathSegment}`) ||
              (!opnameId && pathname === `/opnamen/${section.pathSegment}`);
            // Alle secties zijn altijd klikbaar
            const isAccessible = true;
            
            return (
              <div key={section.id} className="flex flex-col items-center">
                {/* Timeline dot - Clickable */}
                <button
                  onClick={() => handleSectionClick(section.path)}
                  disabled={isActive}
                  className={`relative w-8 h-8 rounded-full border-2 mb-2 flex items-center justify-center transform -translate-y-0.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#c7d316] border-[#c7d316] cursor-default'
                      : isCompleted
                      ? 'bg-[#c7d316] border-[#c7d316] hover:bg-[#b3c014] hover:border-[#b3c014] cursor-pointer'
                      : 'bg-white border-gray-400 hover:bg-gray-50 hover:border-gray-500 cursor-pointer'
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-[#343234] text-xs">✓</span>
                  ) : (
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-[#343234]' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </button>
                
                {/* Section button */}
                <button
                  onClick={() => handleSectionClick(section.path)}
                  disabled={isActive}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 text-center max-w-24 whitespace-pre-line leading-tight ${
                    isActive
                      ? 'bg-[#c7d316] text-[#343234]'
                      : isCompleted
                      ? 'bg-[#c7d316]/20 text-[#343234] hover:bg-[#c7d316]/30 cursor-pointer'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 cursor-pointer'
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