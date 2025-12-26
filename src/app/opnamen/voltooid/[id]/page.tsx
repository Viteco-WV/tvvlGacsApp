'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useOpnameId } from '@/lib/useOpname';
import { generatePDF } from '@/lib/pdf-generator';

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
  verwarmingssysteem?: Record<string, unknown>;
  warmTapwater?: Record<string, unknown>;
  airconditioning?: Record<string, unknown>;
  ventilatie?: Record<string, unknown>;
  verlichting?: Record<string, unknown>;
  zonwering?: Record<string, unknown>;
  gebouwmanagement?: Record<string, unknown>;
}

interface SectionPhoto {
  vraagId: string;
  bestandspad: string;
  beschrijving?: string;
}

interface SectionPhotos {
  [sectionName: string]: SectionPhoto[];
}

export default function VoltooidPage() {
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [opnamenData, setOpnamenData] = useState<OpnamenData | null>(null);
  const [sectionPhotos, setSectionPhotos] = useState<SectionPhotos>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const opnameId = params?.id as string;
  const [, setOpnameId] = useOpnameId();

  useEffect(() => {
    if (opnameId) {
      // Sla opnameId op in sessionStorage voor sectie pagina's
      setOpnameId(opnameId);
      loadAuditData(opnameId);
    } else {
      // Fallback naar localStorage voor backward compatibility
      loadFromLocalStorage();
    }
  }, [opnameId]);

  const loadAuditData = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Haal opname data op
      const opnameResponse = await fetch(`/api/opnamen/${id}`);
      if (!opnameResponse.ok) {
        throw new Error('Opname niet gevonden');
      }
      
      const opname = await opnameResponse.json();
      
      // Converteer naar BuildingData formaat
      const gebouwFoto = opname.fotos && opname.fotos.length > 0 
        ? opname.fotos.find((f: { foto_type: string }) => f.foto_type === 'gebouw') || opname.fotos[0]
        : null;
      
      const bData: BuildingData = {
        buildingName: opname.gebouwnaam || '',
        address: opname.adres || '',
        buildingType: opname.gebouwtype || '',
        energyLabel: opname.energielabel || '',
        contactPerson: opname.contactpersoon || '',
        date: opname.datum_opname ? new Date(opname.datum_opname).toLocaleDateString('nl-NL') : new Date().toLocaleDateString('nl-NL'),
        photo: gebouwFoto && gebouwFoto.bestandspad ? gebouwFoto.bestandspad.replace(/^public\//, '/') : undefined,
      };
      
      setBuildingData(bData);
      
      // Haal antwoorden op per sectie
      const antwoordenResponse = await fetch(`/api/opnamen/${id}/antwoorden`);
      const antwoorden = antwoordenResponse.ok ? await antwoordenResponse.json() : [];
      
      // Groepeer antwoorden per sectie
      const oData: OpnamenData = {};
      const sectieNamen = [
        'verwarmingssysteem',
        'warmTapwater',
        'ventilatie',
        'verlichting',
        'airconditioning',
        'zonwering',
        'gebouwmanagement',
      ];
      
      sectieNamen.forEach(sectieNaam => {
        const sectieAntwoorden = antwoorden.filter((a: { sectie_naam: string }) => a.sectie_naam === sectieNaam);
        if (sectieAntwoorden.length > 0) {
          oData[sectieNaam as keyof OpnamenData] = {};
          sectieAntwoorden.forEach((antwoord: { vraag_id: string; antwoord_waarde?: string; antwoord_nummer?: number; antwoord_boolean?: number }) => {
            if (oData[sectieNaam as keyof OpnamenData]) {
              const value = antwoord.antwoord_waarde || 
                           (antwoord.antwoord_nummer !== null && antwoord.antwoord_nummer !== undefined ? antwoord.antwoord_nummer : null) ||
                           (antwoord.antwoord_boolean !== null && antwoord.antwoord_boolean !== undefined ? (antwoord.antwoord_boolean === 1) : null);
              (oData[sectieNaam as keyof OpnamenData] as Record<string, unknown>)[antwoord.vraag_id] = value;
            }
          });
        }
      });
      
      setOpnamenData(oData);
      
      // Haal foto's op per sectie
      const photosBySection: SectionPhotos = {};
      if (opname.sectieFotos) {
        opname.sectieFotos.forEach((foto: { sectie_naam: string; vraag_id: string; bestandspad: string; beschrijving?: string }) => {
          if (!photosBySection[foto.sectie_naam]) {
            photosBySection[foto.sectie_naam] = [];
          }
          photosBySection[foto.sectie_naam].push({
            vraagId: foto.vraag_id,
            bestandspad: foto.bestandspad,
            beschrijving: foto.beschrijving
          });
        });
      }
      setSectionPhotos(photosBySection);
    } catch (error) {
      console.error('Fout bij laden audit data:', error);
      // Fallback naar localStorage
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const savedBuildingData = localStorage.getItem('gacsBuildingData');
    const savedOpnamenData = localStorage.getItem('gacsOpnamenData');
    
    if (savedBuildingData && savedOpnamenData) {
      setBuildingData(JSON.parse(savedBuildingData));
      setOpnamenData(JSON.parse(savedOpnamenData));
    } else {
      router.push('/opnamen');
    }
    setIsLoading(false);
  };

  const handleGeneratePDF = async () => {
    if (!buildingData || !opnamenData) {
      alert('Geen data beschikbaar om PDF te genereren');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      await generatePDF(buildingData, opnamenData, sectionPhotos);
    } catch (error) {
      console.error('Fout bij genereren PDF:', error);
      alert('Er is een fout opgetreden bij het genereren van de PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportJSON = () => {
    if (!buildingData || !opnamenData) {
      alert('Geen data beschikbaar om te exporteren');
      return;
    }
    
    const allData = {
      buildingData,
      opnamenData,
      sectionPhotos,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gacs-opnamen-${buildingData?.buildingName || 'opname'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEditSection = (sectionPath: string) => {
    // Zorg dat opnameId beschikbaar is voor de sectie pagina
    if (opnameId) {
      setOpnameId(opnameId);
    }
    router.push(sectionPath);
  };

  // Totaal aantal hoofdvragen per sectie (alleen "_van_toepassing" vragen)
  const totalQuestionsPerSection: Record<string, number> = {
    'verwarmingssysteem': 10, // Aantal hoofdvragen in verwarmingssysteem
    'warmTapwater': 4, // Aantal hoofdvragen in warmTapwater
    'ventilatie': 10, // Aantal hoofdvragen in ventilatie
    'verlichting': 2, // Aantal hoofdvragen in verlichting
    'airconditioning': 9, // Aantal hoofdvragen in airconditioning
    'zonwering': 1, // Aantal hoofdvragen in zonwering
    'gebouwmanagement': 7, // Aantal hoofdvragen in gebouwmanagement
  };

  const getSectionStatus = (section: string) => {
    if (!opnamenData) return 'Niet voltooid';
    const progress = getSectionProgress(section);
    if (progress.answered === 0) return 'Niet voltooid';
    if (progress.answered >= progress.total) return 'Voltooid';
    return 'Gedeeltelijk voltooid';
  };

  const getSectionProgress = (section: string) => {
    if (!opnamenData) return { answered: 0, total: totalQuestionsPerSection[section] || 0 };
    
    const sectieData = opnamenData[section as keyof OpnamenData];
    if (!sectieData) {
      return { answered: 0, total: totalQuestionsPerSection[section] || 0 };
    }
    
    // Tel alleen de hoofdvragen (die eindigen op "_van_toepassing")
    // Een vraag is ingevuld als er een waarde is (ook "Nee" telt als ingevuld)
    const answered = Object.keys(sectieData as Record<string, unknown>)
      .filter(key => key.endsWith('_van_toepassing'))
      .filter(key => {
        const value = (sectieData as Record<string, unknown>)[key];
        // Een vraag is ingevuld als er een waarde is (niet null, undefined, of lege string)
        return value !== null && value !== undefined && value !== '';
      }).length;
    
    return {
      answered,
      total: totalQuestionsPerSection[section] || 0
    };
  };

  const sections = [
    { key: 'verwarmingssysteem', name: '1. Verwarmingssysteem onderdelen', path: `/opnamen/${opnameId}/verwarmingssysteem` },
    { key: 'warmTapwater', name: '2. Warm tapwater onderdelen', path: `/opnamen/${opnameId}/warm-tapwater` },
    { key: 'ventilatie', name: '3. Ventilatie onderdelen', path: `/opnamen/${opnameId}/ventilatie` },
    { key: 'verlichting', name: '4. Verlichting onderdelen', path: `/opnamen/${opnameId}/verlichting` },
    { key: 'airconditioning', name: '5. Airconditioning onderdelen', path: `/opnamen/${opnameId}/airconditioning` },
    { key: 'zonwering', name: '6. Zonwering onderdelen', path: `/opnamen/${opnameId}/zonwering` },
    { key: 'gebouwmanagement', name: '7. Gebouwmanagement onderdelen', path: `/opnamen/${opnameId}/gebouwmanagement` }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c7d316] mx-auto mb-4"></div>
          <p className="text-[#343234]">Laden...</p>
        </div>
      </div>
    );
  }

  if (!buildingData || !opnamenData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#343234] mb-4">Geen data gevonden</p>
          <button
            onClick={() => router.push('/opnamen')}
            className="bg-[#c7d316] text-[#343234] px-6 py-3 rounded-lg hover:bg-[#b3c014] transition-colors duration-200 font-bold"
          >
            Terug naar overzicht
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Gebouwgegevens */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Gebouwgegevens</h2>
                <button
                  onClick={() => handleEditSection(`/opnamen/${opnameId}/algemeen`)}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                  title="Bewerken"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              
              {/* Building Photo */}
              <div className="mb-4">
                <img 
                  src={buildingData.photo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop&crop=center"} 
                  alt="Gebouw foto" 
                  className="w-full h-75 object-cover rounded-md border border-gray-200"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Gebouw:</span>
                  <span className="text-gray-900 text-right">{buildingData.buildingName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Adres:</span>
                  <span className="text-gray-900 text-right">{buildingData.address}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-900 text-right">{buildingData.buildingType || 'Niet opgegeven'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Energielabel:</span>
                  <span className="text-gray-900 text-right">{buildingData.energyLabel || 'Niet opgegeven'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Datum:</span>
                  <span className="text-gray-900 text-right">{buildingData.date}</span>
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
                  const isPartiallyCompleted = status === 'Gedeeltelijk voltooid';
                  const progress = getSectionProgress(section.key);
                  
                  return (
                    <div 
                      key={section.key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-800">{section.name}</span>
                        <span className="text-xs text-gray-500 mt-1">
                          {progress.answered} van {progress.total} vragen ingevuld
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isPartiallyCompleted
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {status}
                        </span>
                        <button
                          onClick={() => handleEditSection(section.path)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                          title="Bewerken"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {/* Export Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <button
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                    className="w-full bg-[#343234] text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        PDF genereren...
                      </span>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF genereren
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium text-lg flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    JSON exporteren
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => router.push(`/opnamen/${opnameId}/algemeen`)}
              className="bg-[#c7d316] text-[#343234] px-6 py-3 rounded-lg hover:bg-[#b3c014] transition-colors duration-200 font-bold flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nieuwe opnamen starten
            </button>
            <button
              onClick={() => router.push('/opnamen')}
              className="bg-[#343234] text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-bold flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Terug naar overzicht
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

