'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    loadAuditRecords();
  }, []);

  const loadAuditRecords = () => {
    try {
      // Haal alle opgeslagen audits op uit localStorage
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
          const record: AuditRecord = {
            id: Date.now().toString(),
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
          };
          
          setAuditRecords([record]);
        }
      }
    } catch (error) {
      console.error('Fout bij laden audit records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewAudit = () => {
    // Wis alle bestaande data
    localStorage.removeItem('gacsBuildingData');
    localStorage.removeItem('gacsOpnamenData');
    router.push('/opnamen/algemeen');
  };

  const handleContinueAudit = (record: AuditRecord) => {
    // Laad de data en ga naar de voltooid pagina
    router.push('/opnamen/voltooid');
  };

  const handleDeleteAudit = (recordId: string) => {
    if (confirm('Weet je zeker dat je deze audit wilt verwijderen?')) {
      localStorage.removeItem('gacsBuildingData');
      localStorage.removeItem('gacsOpnamenData');
      setAuditRecords([]);
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#343234] mb-2">
                  GACS Audit Overzicht
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
                Nieuwe Audit Starten
              </button>
            </div>
          </div>

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
                Eerste Audit Starten
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
                          onClick={() => handleContinueAudit(record)}
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

          {/* Information Panel */}
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="font-semibold text-blue-800 mb-3">Informatie</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Alle audits worden lokaal opgeslagen in uw browser</li>
              <li>• U kunt meerdere audits beheren en vergelijken</li>
              <li>• Klik op "Bekijken" om een audit te openen</li>
              <li>• Gebruik "Verwijderen" om een audit permanent te wissen</li>
              <li>• Start een nieuwe audit om een ander gebouw te registreren</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 