'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TimelineNavigation from '@/components/TimelineNavigation';
import Header from '@/components/Header';

interface BuildingData {
  buildingName: string;
  address: string;
  buildingType: string;
  contactPerson: string;
  date: string;
}

export default function GebouwmanagementPage() {
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  const questions = [
    // Sectie 1: Regeling setpoint
    {
      id: 'setpoint_van_toepassing',
      question: 'Vraag 1.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '1 - Regeling setpoint'
    },
    {
      id: 'setpoint_regeling',
      question: 'Vraag 1.2 - Hoe is de regeling setpoint?',
      type: 'select',
      options: [
        'Handmatige setpoint instelling per ruimte',
        'Setpoint instelling alleen vanuit GEDECENTRALISEERDE technische ruimtes',
        'Setpoint instelling vanuit een centraal punt',
        'Setpoint instelling vanuit een centraal punt met regelmatige overschrijving van gebruikersinstellingen'
      ],
      conditional: 'setpoint_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling setpoint'
    },
    // Sectie 2: Runtime regeling
    {
      id: 'runtime_van_toepassing',
      question: 'Vraag 2.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '2 - Runtime regeling'
    },
    {
      id: 'runtime_regeling',
      question: 'Vraag 2.2 - Hoe is de runtime regeling?',
      type: 'select',
      options: [
        'Handmatige instelling',
        'Individuele tijdgestuurde regeling met vaste schakelpunten',
        'Individuele tijdgestuurde regeling met variabele schakelpunten'
      ],
      conditional: 'runtime_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Runtime regeling'
    },
    // Sectie 3: Storingsdetectie en foutdiagnose
    {
      id: 'storingsdetectie_van_toepassing',
      question: 'Vraag 3.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '3 - Storingsdetectie en foutdiagnose'
    },
    {
      id: 'storingsdetectie_regeling',
      question: 'Vraag 3.2 - Hoe is de storingsdetectie en foutdiagnose?',
      type: 'select',
      options: [
        'Geen centrale detectie van storingen en alarmen',
        'Centrale indicatie van storingen of alarmen',
        'Centrale indicatie van fouten of alarmen met diagnostische functies'
      ],
      conditional: 'storingsdetectie_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Storingsdetectie en foutdiagnose'
    },
    // Sectie 4: Energieconsumptie en binnenklimaat rapportage
    {
      id: 'energieconsumptie_van_toepassing',
      question: 'Vraag 4.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '4 - Energieconsumptie en binnenklimaat rapportage'
    },
    {
      id: 'energieconsumptie_regeling',
      question: 'Vraag 4.2 - Hoe is de energieconsumptie en binnenklimaat rapportage?',
      type: 'select',
      options: [
        'Alleen indicatie van gemeten waarden (zoals temperatuur, meterstanden)',
        'Rapportage van trends in gemeten waarden en energieconsumptie',
        'Analyse van gemeten waarden, bepaling van energieprestatie en benchmarking'
      ],
      conditional: 'energieconsumptie_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Energieconsumptie en binnenklimaat rapportage'
    },
    // Sectie 5: Lokale energieproductie en hernieuwbare energie
    {
      id: 'lokale_energie_van_toepassing',
      question: 'Vraag 5.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '5 - Lokale energieproductie en hernieuwbare energie'
    },
    {
      id: 'lokale_energie_regeling',
      question: 'Vraag 5.2 - Hoe is de lokale energieproductie en hernieuwbare energie?',
      type: 'select',
      options: [
        'Geen (alle vormen van regeling van lokale energieproductie zijn toegestaan)',
        'Ongereguleerde energieproductie, gebaseerd op de beschikbaarheid van de energiebron met teruglevering van energieoverschotten aan het net',
        'Energie'
      ],
      conditional: 'lokale_energie_van_toepassing',
      conditionalValue: 'Ja',
      section: '5 - Lokale energieproductie en hernieuwbare energie'
    },
    // Sectie 6: Hergebruik restwarmte en verschuiving warmtevraag
    {
      id: 'restwarmte_van_toepassing',
      question: 'Vraag 6.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '6 - Hergebruik restwarmte en verschuiving warmtevraag'
    },
    {
      id: 'restwarmte_regeling',
      question: 'Vraag 6.2 - Hoe is het hergebruik restwarmte en verschuiving warmtevraag?',
      type: 'select',
      options: [
        'Direct hergebruik van restwarmte of verschuiving warmtevraag',
        'Gereguleerd gebruik van restwarmte en verschuiving warmtevraag (inclusief gebruik van thermische energieopslag)'
      ],
      conditional: 'restwarmte_van_toepassing',
      conditionalValue: 'Ja',
      section: '6 - Hergebruik restwarmte en verschuiving warmtevraag'
    },
    // Sectie 7: Smart grid integratie
    {
      id: 'smart_grid_van_toepassing',
      question: 'Vraag 7.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '7 - Smart grid integratie'
    },
    {
      id: 'smart_grid_regeling',
      question: 'Vraag 7.2 - Hoe is de smart grid integratie?',
      type: 'select',
      options: [
        'Geen (alle vormen van smart grid integratie zijn toegestaan)',
        'Geen coördinatie tussen energienetten (net) en gebouwsystemen',
        'Coördinatie tussen energienetten (net) en gebouwsystemen met lastverschuiving'
      ],
      conditional: 'smart_grid_van_toepassing',
      conditionalValue: 'Ja',
      section: '7 - Smart grid integratie'
    }
  ];

  useEffect(() => {
    const savedBuildingData = localStorage.getItem('gacsBuildingData');
    if (savedBuildingData) {
      setBuildingData(JSON.parse(savedBuildingData));
    }

    const savedAnswers = localStorage.getItem('gacsOpnamenData');
    if (savedAnswers) {
      const parsedAnswers = JSON.parse(savedAnswers);
      if (parsedAnswers.gebouwmanagement) {
        setAnswers(parsedAnswers.gebouwmanagement);
      }
    }
  }, []);

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.gebouwmanagement = newAnswers;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
  };

  const handleSave = () => {
    // Sla antwoorden op
    const allData = {
      ...answers,
      section: 'gebouwmanagement',
      timestamp: new Date().toISOString()
    };
    
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.gebouwmanagement = allData;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
  };

  const handleNext = () => {
    handleSave();
    router.push('/opnamen/voltooid');
  };

  const handlePrevious = () => {
    handleSave();
    router.push('/opnamen/zonwering');
  };

  const renderQuestion = (question: Record<string, unknown>) => {
    // Check if this question should be shown based on conditional logic
    if (question.conditional && question.conditionalValue) {
      const conditionalAnswer = answers[question.conditional as string];
      if (conditionalAnswer !== question.conditionalValue) {
        return null; // Don't render this question
      }
    }

    const currentAnswer = (answers[question.id as string] as string) || '';

    switch (question.type) {
      case 'select':
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecteer een optie</option>
            {(question.options as string[])?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {(question.options as string[])?.map((option: string) => (
              <label key={option} className="flex items-center space-x-2 font-bold">
                <input
                  type="radio"
                  name={question.id as string}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
                  className="text-[#343234] focus:ring-green-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            rows={4}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Voer uw antwoord in..."
          />
        );

      default:
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Voer uw antwoord in..."
          />
        );
    }
  };

  if (!buildingData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <TimelineNavigation />
          
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-[#c7d316]/10 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#c7d314] rounded-lg flex items-center justify-center">
                  <span className="text-[#343234] font-bold text-lg">7</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Technisch gebouwmanagement onderdelen
                </h1>
              </div>
              <div className="bg-[#c7d316]/10 text-[#343234] px-3 py-1 rounded-full text-sm font-medium">
                {Object.keys(questions.reduce((acc, question) => {
                  const section = question.section || 'Overig';
                  acc[section] = true;
                  return acc;
                }, {} as Record<string, boolean>)).length} secties
              </div>
            </div>
            
            <div className="p-8">
              {/* All Questions */}
              <div className="space-y-8">
                {(() => {
                  // Group questions by section
                  const groupedQuestions = questions.reduce((acc, question) => {
                    const section = question.section || 'Overig';
                    if (!acc[section]) {
                      acc[section] = [];
                    }
                    acc[section].push(question);
                    return acc;
                  }, {} as Record<string, typeof questions>);

                  return Object.entries(groupedQuestions).map(([sectionName, sectionQuestions]) => (
                    <div key={sectionName} className="border-b border-gray-200 pb-6">
                      <h2 className="text-xl font-bold text-[#343234] mb-6">
                        {sectionName}
                      </h2>
                      <div className="space-y-6">
                        {sectionQuestions.map((question, index) => {
                          const renderedQuestion = renderQuestion(question);
                          if (!renderedQuestion) return null;
                          
                          return (
                            <div key={question.id as string} className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="text-lg font-semibold text-[#343234] mb-4">
                                {question.question}
                              </h3>
                              
                              <div className="mb-4">
                                {renderedQuestion}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <div className="flex justify-center mt-8 pt-6 border-t border-gray-200 space-x-4">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 bg-[#343234] text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2 font-bold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Vorige onderdeel</span>
                </button>
                
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[#c7d314] text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 font-bold"
                >
                  <span>Volgende onderdeel</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 