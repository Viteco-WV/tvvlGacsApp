'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BuildingData {
  buildingName: string;
  address: string;
  buildingType: string;
  energyLabel: string;
  contactPerson: string;
  date: string;
  photo?: string;
}

interface OpnamenData {
  verwarmingssysteem?: any;
  warmTapwater?: any;
  airconditioning?: any;
  ventilatie?: any;
  verlichting?: any;
  zonwering?: any;
  gebouwmanagement?: any;
}

export default function VoltooidPage() {
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [opnamenData, setOpnamenData] = useState<OpnamenData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedBuildingData = localStorage.getItem('gacsBuildingData');
    const savedOpnamenData = localStorage.getItem('gacsOpnamenData');
    
    if (savedBuildingData && savedOpnamenData) {
      setBuildingData(JSON.parse(savedBuildingData));
      setOpnamenData(JSON.parse(savedOpnamenData));
    } else {
      router.push('/');
    }
  }, [router]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Hier zou je de PDF generatie logica implementeren
      // Voor nu simuleren we dit met een timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Download de data als JSON (tijdelijke oplossing)
      const allData = {
        buildingData,
        opnamenData,
        generatedAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gacs-opnamen-${buildingData?.buildingName}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Fout bij genereren PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewOpnamen = () => {
    // Wis alle data en start opnieuw
    localStorage.removeItem('gacsBuildingData');
    localStorage.removeItem('gacsOpnamenData');
    router.push('/');
  };

  const handleEditSection = (sectionPath: string) => {
    router.push(sectionPath);
  };

  const getSectionStatus = (section: string) => {
    if (!opnamenData) return 'Niet voltooid';
    return opnamenData[section as keyof OpnamenData] ? 'Voltooid' : 'Niet voltooid';
  };

  const sections = [
    { key: 'verwarmingssysteem', name: '1. Verwarmingssysteem onderdelen', path: '/opnamen/verwarmingssysteem' },
    { key: 'warmTapwater', name: '2. Warm tapwater onderdelen', path: '/opnamen/warm-tapwater' },
    { key: 'ventilatie', name: '3. Ventilatie onderdelen', path: '/opnamen/ventilatie' },
    { key: 'verlichting', name: '4. Verlichting onderdelen', path: '/opnamen/verlichting' },
    { key: 'airconditioning', name: '5. Airconditioning onderdelen', path: '/opnamen/airconditioning' },
    { key: 'zonwering', name: '6. Zonwering onderdelen', path: '/opnamen/zonwering' },
    { key: 'gebouwmanagement', name: '7. Gebouwmanagement onderdelen', path: '/opnamen/gebouwmanagement' }
  ];

  if (!buildingData || !opnamenData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Status Banner */}
          <div className="bg-green-50 rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-xl">✓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-800">
                  Opnamen Voltooid!
                </h1>
                <p className="text-green-700">
                  Alle onderdelen zijn succesvol opgenomen
                </p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Gebouwgegevens */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Gebouwgegevens</h2>
              
              {/* Building Photo */}
              <div className="mb-4">
                <img 
                  src={buildingData.photo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop&crop=center"} 
                  alt="Gebouw foto" 
                  className="w-full h-75 object-cover rounded-md border border-gray-200"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Gebouw:</span>
                  <span className="text-gray-900">{buildingData.buildingName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Adres:</span>
                  <span className="text-gray-900">{buildingData.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-900">{buildingData.buildingType || 'Niet opgegeven'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Energielabel:</span>
                  <span className="text-gray-900">{buildingData.energyLabel || 'Niet opgegeven'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Datum:</span>
                  <span className="text-gray-900">{buildingData.date}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Overzicht Onderdelen */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Overzicht onderdelen</h2>
              <div className="space-y-3">
                {sections.map((section) => {
                  const status = getSectionStatus(section.key);
                  const isCompleted = status === 'Voltooid';
                  
                  return (
                    <div 
                      key={section.key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-full"
                    >
                      <span className="text-gray-800">{section.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {status}
                        </span>
                        {isCompleted && (
                          <button
                            onClick={() => handleEditSection(section.path)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                            title="Bewerken"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Rapport Genereren Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Rapport genereren...
                      </span>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Rapport genereren
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          

          {/* Information Panel */}
          <div className="bg-yellow-50 rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-yellow-800 mb-3">Informatie</h3>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li>• Alle opnamen zijn lokaal opgeslagen in uw browser</li>
              <li>• U kunt het rapport downloaden als JSON bestand</li>
              <li>• Voor PDF export is een backend implementatie nodig</li>
              <li>• Start een nieuwe opnamen om een ander gebouw te registreren</li>
              <li>• Klik op het bewerk-icoon naast het vinkje om een onderdeel aan te passen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 