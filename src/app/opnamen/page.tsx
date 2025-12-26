'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MigrateLocalStorageButton from '@/components/MigrateLocalStorageButton';

interface AuditRecord {
  id: string;
  buildingName: string;
  address: string;
  buildingType: string;
  date: string;
  status: 'completed' | 'in_progress' | 'draft';
  sections: {
    algemeen: boolean;
    verwarmingssysteem: boolean;
    warmTapwater: boolean;
    ventilatie: boolean;
    verlichting: boolean;
    airconditioning: boolean;
    zonwering: boolean;
    gebouwmanagement: boolean;
  };
}

export default function OpnamenOverviewPage() {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadAuditRecords();
  }, []);

  const loadAuditRecords = async () => {
    try {
      const records: AuditRecord[] = [];

      // 1. Haal audits op uit database
      try {
        const response = await fetch('/api/opnamen');
        if (response.ok) {
          const opnamen = await response.json();
          
          for (const opname of opnamen) {
            // Haal secties op voor deze opname
            const sectiesResponse = await fetch(`/api/opnamen/${opname.id}/antwoorden`);
            const antwoorden = sectiesResponse.ok ? await sectiesResponse.json() : [];
            
            // Groepeer antwoorden per sectie
            const sectiesMap: Record<string, boolean> = {};
            antwoorden.forEach((antwoord: { sectie_naam: string }) => {
              sectiesMap[antwoord.sectie_naam] = true;
            });

            records.push({
              id: opname.id,
              buildingName: opname.gebouwnaam || 'Onbekend gebouw',
              address: opname.adres || 'Geen adres',
              buildingType: opname.gebouwtype || 'Niet opgegeven',
              date: opname.datum_opname ? new Date(opname.datum_opname).toLocaleDateString('nl-NL') : new Date().toLocaleDateString('nl-NL'),
              status: opname.status === 'completed' ? 'completed' : opname.status === 'in_progress' ? 'in_progress' : 'draft',
              sections: {
                algemeen: !!opname.gebouwnaam,
                verwarmingssysteem: !!sectiesMap['verwarmingssysteem'],
                warmTapwater: !!sectiesMap['warmTapwater'],
                ventilatie: !!sectiesMap['ventilatie'],
                verlichting: !!sectiesMap['verlichting'],
                airconditioning: !!sectiesMap['airconditioning'],
                zonwering: !!sectiesMap['zonwering'],
                gebouwmanagement: !!sectiesMap['gebouwmanagement'],
              }
            });
          }
        }
      } catch (error) {
        console.error('Fout bij laden audits uit database:', error);
      }

      // 2. Haal ook audits op uit localStorage (backward compatibility)
      const savedBuildingData = localStorage.getItem('gacsBuildingData');
      const savedOpnamenData = localStorage.getItem('gacsOpnamenData');
      
      if (savedBuildingData && savedOpnamenData) {
        const buildingData = JSON.parse(savedBuildingData);
        const opnamenData = JSON.parse(savedOpnamenData);
        
        // Controleer of er daadwerkelijk data is
        const hasAnyData = Object.keys(opnamenData).some(key => 
          opnamenData[key] && Object.keys(opnamenData[key]).length > 0
        );
        
        if (hasAnyData) {
          // Check of deze audit al in de database staat (op basis van gebouwnaam en adres)
          const existsInDatabase = records.some(r => 
            r.buildingName === buildingData.buildingName && 
            r.address === buildingData.address
          );

          // Voeg alleen toe als het niet al in de database staat
          if (!existsInDatabase) {
            records.push({
              id: `local-${Date.now()}`,
            buildingName: buildingData.buildingName || 'Onbekend gebouw',
            address: buildingData.address || 'Geen adres',
            buildingType: buildingData.buildingType || 'Niet opgegeven',
            date: buildingData.date || new Date().toLocaleDateString('nl-NL'),
            status: 'completed',
            sections: {
              algemeen: !!buildingData.buildingName,
              verwarmingssysteem: !!opnamenData.verwarmingssysteem,
              warmTapwater: !!opnamenData.warmTapwater,
              ventilatie: !!opnamenData.ventilatie,
              verlichting: !!opnamenData.verlichting,
              airconditioning: !!opnamenData.airconditioning,
              zonwering: !!opnamenData.zonwering,
              gebouwmanagement: !!opnamenData.gebouwmanagement,
            }
            });
          }
        }
      }

      setAuditRecords(records);
    } catch (error) {
      console.error('Fout bij laden audit records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewAudit = () => {
    setShowModal(true);
  };

  const handleStartTraditionalAudit = async () => {
    // Wis alle bestaande data
    localStorage.removeItem('gacsBuildingData');
    localStorage.removeItem('gacsOpnamenData');
    
    try {
      // Maak direct een nieuwe lege opname aan in database
      const response = await fetch('/api/opnamen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opnameType: 'basis',
          gebouwnaam: 'Nieuw gebouw',
          adres: '',
          datumOpname: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fout bij aanmaken opname');
      }

      const newOpname = await response.json();
      const newOpnameId = newOpname.id;

      // Navigeer direct naar algemeen pagina met opnameId in URL
      router.push(`/opnamen/${newOpnameId}/algemeen`);
    } catch (error) {
      console.error('Fout bij aanmaken opname:', error);
      const errorMessage = error instanceof Error ? error.message : 'Fout bij aanmaken opname';
      alert(`Fout bij starten nieuwe audit: ${errorMessage}`);
    }
    
    setShowModal(false);
  };

  const handleContinueAudit = (recordId?: string) => {
    // Als het een database record is, navigeer naar voltooid pagina met ID
    if (recordId && !recordId.startsWith('local-')) {
      router.push(`/opnamen/voltooid/${recordId}`);
    } else {
      // Voor localStorage records, ga naar oude voltooid pagina
    router.push('/opnamen/voltooid');
    }
  };

  const handleDeleteAudit = async (recordId: string) => {
    if (confirm('Weet je zeker dat je deze audit wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      try {
        // Als het een database record is, verwijder uit database
        if (!recordId.startsWith('local-')) {
          const response = await fetch(`/api/opnamen/${recordId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Onbekende fout' }));
            throw new Error(errorData.error || 'Fout bij verwijderen uit database');
          }
          
          // Toon succesmelding
          alert('Audit succesvol verwijderd');
        } else {
          // Als het een localStorage record is, verwijder uit localStorage
      localStorage.removeItem('gacsBuildingData');
      localStorage.removeItem('gacsOpnamenData');
          alert('Audit succesvol verwijderd');
        }
        
        // Herlaad de lijst
        await loadAuditRecords();
      } catch (error) {
        console.error('Fout bij verwijderen audit:', error);
        const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
        alert(`Fout bij verwijderen audit: ${errorMessage}`);
      }
    }
  };

  const getCompletionPercentage = (sections: AuditRecord['sections']) => {
    const totalSections = Object.keys(sections).length;
    const completedSections = Object.values(sections).filter(Boolean).length;
    return Math.round((completedSections / totalSections) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Voltooid';
      case 'in_progress':
        return 'In uitvoering';
      case 'draft':
        return 'Concept';
      default:
        return 'Onbekend';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c7d316] mx-auto mb-4"></div>
          <p className="text-[#343234]">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* Header van home page */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => router.push('/')}
              >
                <img 
                  src="/TVVL-logo-los.png" 
                  alt="TVVL Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-gray-800">GACS Platform</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#343234] mb-2">
                  GACS-audit overzicht
                </h1>
                <p className="text-gray-600">
                  Beheer al je gebouw audits en start nieuwe opnamen
                </p>
              </div>
              <button
                onClick={handleStartNewAudit}
                className="bg-[#c7d316] text-[#343234] px-6 py-3 rounded-lg hover:bg-[#b3c014] transition-colors duration-200 font-bold flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nieuwe audit starten
              </button>
            </div>
          </div>

          {/* Migratie Button */}
          <MigrateLocalStorageButton />

          {/* Audit Records */}
          {auditRecords.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#343234] mb-2">
                Geen audits gevonden
              </h3>
              <p className="text-gray-600 mb-6">
                Start je eerste GACS audit om gebouwen te registreren en te beoordelen
              </p>
              <button
                onClick={handleStartNewAudit}
                className="bg-[#c7d316] text-[#343234] px-6 py-3 rounded-lg hover:bg-[#b3c014] transition-colors duration-200 font-bold"
              >
                Eerste audit starten
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {auditRecords.map((record) => (
                <div key={record.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#343234] mb-1">
                        {record.buildingName}
                      </h3>
                      <p className="text-gray-600 mb-2">{record.address}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Type: {record.buildingType}</span>
                        <span>Datum: {record.date}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#c7d316]">
                          {getCompletionPercentage(record.sections)}%
                        </div>
                        <div className="text-sm text-gray-500">Voltooid</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleContinueAudit(record.id)}
                          className="bg-[#c7d316] text-[#343234] px-4 py-2 rounded-lg hover:bg-[#b3c014] transition-colors duration-200 font-medium text-sm"
                        >
                          Bekijken
                        </button>
                        <button
                          onClick={() => handleDeleteAudit(record.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium text-sm"
                        >
                          Verwijderen
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-[#c7d316] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getCompletionPercentage(record.sections)}%` }}
                    ></div>
                  </div>
                  
                  {/* Sections Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(record.sections).map(([section, completed]) => (
                      <div key={section} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${completed ? 'bg-[#c7d316]' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-600 capitalize">
                          {section === 'warmTapwater' ? 'Warm tapwater' : 
                           section === 'airconditioning' ? 'Koeling' : 
                           section === 'gebouwmanagement' ? 'Gebouwmanagement' :
                           section}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal voor nieuwe audit starten */}
      {showModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-[#343234] mb-6 text-center">
              Nieuwe audit starten
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Weet je zeker dat je een nieuwe audit wilt starten?<br />
              Alle niet-opgeslagen wijzigingen gaan verloren.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleStartTraditionalAudit}
                className="w-full bg-[#c7d316] text-[#343234] px-6 py-4 rounded-lg hover:bg-[#b3c014] transition-colors duration-200 font-bold text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-lg font-semibold">Start nieuwe audit</div>
                  <div className="text-sm opacity-90">Begin met een nieuwe GACS audit</div>
                </div>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 