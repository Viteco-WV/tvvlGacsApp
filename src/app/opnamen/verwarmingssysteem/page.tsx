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

export default function VerwarmingssysteemPage() {
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const router = useRouter();

  // Vragen voor verwarmingssysteem
  const questions = [
    // Sectie 1: Warmteafgifte
    {
      id: 'warmteafgifte_van_toepassing',
      question: 'Vraag 1.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '1 - Warmteafgifte'
    },
    {
      id: 'warmteafgifte_regeling',
      question: 'Vraag 1.2 - Hoe wordt de warmteafgifte geregeld?',
      type: 'select',
      options: [
        'Geen automatische temperatuurregeling',
        'Centrale automatische temperatuurregeling',
        'Individuele temperatuurregeling per ruimte',
        'Individuele temperatuurregeling per ruimte met communicatie naar centraal systeem',
        'Individuele temperatuurregeling per ruimte met communicatie en aanwezigheidsdetectie'
      ],
      conditional: 'warmteafgifte_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Warmteafgifte'
    },
    // Sectie 2: Thermisch geactiveerde gebouwstructuren
    {
      id: 'thermisch_geactiveerd_van_toepassing',
      question: 'Vraag 2.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '2 - Thermisch geactiveerde gebouwstructuren'
    },
    {
      id: 'thermisch_geactiveerd_regeling',
      question: 'Vraag 2.2 - Hoe is de warmteafgifte geregeld?',
      type: 'select',
      options: [
        'Geen automatische temperatuurregeling',
        'Centrale automatische temperatuurregeling',
        'Geavanceerde centrale temperatuurregeling',
        'Geavanceerde centrale temperatuurregeling met niet-continue gebruik en/of ruimtetemperatuur terugkoppeling'
      ],
      conditional: 'thermisch_geactiveerd_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Thermisch geactiveerde gebouwstructuren'
    },
    // Sectie 3: Regeling van watertemperatuur in distributienetwerk
    {
      id: 'watertemperatuur_van_toepassing',
      question: 'Vraag 3.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '3 - Regeling van watertemperatuur in distributienetwerk'
    },
    {
      id: 'watertemperatuur_regeling',
      question: 'Vraag 3.2 - Hoe is de watertemperatuur geregeld?',
      type: 'select',
      options: [
        'Geen automatische regeling',
        'Buitentemperatuur-compensatie regeling',
        'Vraag gestuurde regeling'
      ],
      conditional: 'watertemperatuur_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Regeling van watertemperatuur in distributienetwerk'
    },
    // Sectie 4: Regeling van distributiepompen
    {
      id: 'distributiepompen_van_toepassing',
      question: 'Vraag 4.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '4 - Regeling van distributiepompen'
    },
    {
      id: 'distributiepompen_regeling',
      question: 'Vraag 4.2 - Hoe is de distributiepompen geregeld?',
      type: 'select',
      options: [
        'Geen automatische regeling',
        'Aan-uit regeling',
        'Multi-fase / multi-stap regeling',
        'Variabele snelheid regeling (intern of extern)'
      ],
      conditional: 'distributiepompen_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Regeling van distributiepompen'
    },
    // Sectie 5: Aan-uit regeling van verwarmingsysteem
    {
      id: 'aan_uit_regeling_van_toepassing',
      question: 'Vraag 5.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '5 - Aan-uit regeling van verwarmingsysteem'
    },
    {
      id: 'aan_uit_regeling_status',
      question: 'Vraag 5.2 - Hoe is de status van verwarming geregeld?',
      type: 'select',
      options: [
        'Geen automatische regeling',
        'Automatische regeling met timer',
        'Automatische regeling met start-stop optimalisatie',
        'Automatische vraag gestuurde regeling (intern/extern)'
      ],
      conditional: 'aan_uit_regeling_van_toepassing',
      conditionalValue: 'Ja',
      section: '5 - Aan-uit regeling van verwarmingsysteem'
    },
    // Sectie 6: Regeling verwarmingstoestel (verbrandingstoestellen en warmtelevering)
    {
      id: 'verwarmingstoestel_van_toepassing',
      question: 'Vraag 6.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '6 - Regeling verwarmingstoestel (verbrandingstoestellen en warmtelevering)'
    },
    {
      id: 'verwarmingstoestel_regeling',
      question: 'Vraag 6.2 - Hoe is de regeling van het verwarmingstoestel?',
      type: 'select',
      options: [
        'Vaste temperatuurinstelling',
        'Variable temperatuurinstelling gebaseerd op buitentemperatuur',
        'Vraag gestuurde variable temperatuurinstelling'
      ],
      conditional: 'verwarmingstoestel_van_toepassing',
      conditionalValue: 'Ja',
      section: '6 - Regeling verwarmingstoestel (verbrandingstoestellen en warmtelevering)'
    },
    // Sectie 7: Regeling verwarmingstoestel (warmtepomp)
    {
      id: 'warmtepomp_van_toepassing',
      question: 'Vraag 7.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '7 - Regeling verwarmingstoestel (warmtepomp)'
    },
    {
      id: 'warmtepomp_regeling',
      question: 'Vraag 7.2 - Hoe is de regeling van het verwarmingstoestel?',
      type: 'select',
      options: [
        'Vaste temperatuurinstelling',
        'Variable temperatuurinstelling gebaseerd op buitentemperatuur',
        'Vraag gestuurde variable temperatuurinstelling'
      ],
      conditional: 'warmtepomp_van_toepassing',
      conditionalValue: 'Ja',
      section: '7 - Regeling verwarmingstoestel (warmtepomp)'
    },
    // Sectie 8: Regeling verwarmingstoestel (buiten unit)
    {
      id: 'buiten_unit_van_toepassing',
      question: 'Vraag 8.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '8 - Regeling verwarmingstoestel (buiten unit)'
    },
    {
      id: 'buiten_unit_regeling',
      question: 'Vraag 8.2 - Hoe is de regeling van het verwarmingstoestel?',
      type: 'select',
      options: [
        'Aan-uit regeling',
        'Multi-stappen regeling',
        'Variabele regeling'
      ],
      conditional: 'buiten_unit_van_toepassing',
      conditionalValue: 'Ja',
      section: '8 - Regeling verwarmingstoestel (buiten unit)'
    },
    // Sectie 9: Volgorde van warmte-opwekkers
    {
      id: 'warmte_opwekkers_van_toepassing',
      question: 'Vraag 9.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '9 - Volgorde van warmte-opwekkers'
    },
    {
      id: 'warmte_opwekkers_regeling',
      question: 'Vraag 9.2 - Hoe is de regeling van het verwarmingstoestel?',
      type: 'select',
      options: [
        'Vaste volgorde',
        'Prioritering gebaseerd op belasting (warmtevraag)',
        'Dynamische prioritering gebaseerd op efficiency en karakteristieken van de toestellen',
        'Vraag gestuurde prioritering (gebaseerd op meerdere parameters)'
      ],
      conditional: 'warmte_opwekkers_van_toepassing',
      conditionalValue: 'Ja',
      section: '9 - Volgorde van warmte-opwekkers'
    },
    // Sectie 10: Warmteopslag
    {
      id: 'warmteopslag_van_toepassing',
      question: 'Vraag 10.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '10 - Warmteopslag'
    },
    {
      id: 'warmteopslag_regeling',
      question: 'Vraag 10.2 - Hoe is de regeling van het verwarmingstoestel?',
      type: 'select',
      options: [
        'Continue bedrijf',
        'Twee-sensor gestuurde warmteopslag',
        'Behoefte voorspellend warmteopslag'
      ],
      conditional: 'warmteopslag_van_toepassing',
      conditionalValue: 'Ja',
      section: '10 - Warmteopslag'
    }
  ];

  useEffect(() => {
    const savedData = localStorage.getItem('gacsBuildingData');
    if (savedData) {
      setBuildingData(JSON.parse(savedData));
    } else {
      router.push('/');
    }

    // Load existing answers
    const opnamenData = localStorage.getItem('gacsOpnamenData');
    if (opnamenData) {
      const data = JSON.parse(opnamenData);
      if (data.verwarmingssysteem) {
        setAnswers(data.verwarmingssysteem);
      }
    }
  }, [router]);

  const handleAnswerChange = (questionId: string, value: unknown) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSave = () => {
    // Sla antwoorden op
    const allData = {
      ...answers,
      section: 'verwarmingssysteem',
      timestamp: new Date().toISOString()
    };
    
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.verwarmingssysteem = allData;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
  };

  const handleNext = () => {
    handleSave();
    router.push('/opnamen/warm-tapwater');
  };

  const handlePrevious = () => {
    router.push('/opnamen/algemeen');
  };

  const renderQuestion = (question: Record<string, unknown>) => {
    const currentAnswer = (answers[question.id as string] as string) || '';

    // Check if this is a conditional question
    if (question.conditional) {
      const conditionalAnswer = answers[question.conditional as string] as string;
      if (conditionalAnswer !== question.conditionalValue) {
        return null; // Don't render this question
      }
    }

    switch (question.type) {
      case 'select':
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
          >
            <option value="">Selecteer een optie</option>
            {(question.options as string[])?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {(question.options as string[])?.map((option: string) => (
              <label key={option} className="flex items-center space-x-2">
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
            min={question.min as number}
            max={question.max as number}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            placeholder="Voer uw antwoord in..."
          />
        );

      default:
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
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
          {/* Timeline Navigation - Above the box */}
          <TimelineNavigation />
          
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#c7d316]/10 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#c7d314] rounded-lg flex items-center justify-center">
                  <span className="text-[#343234] font-bold text-lg">2</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Verwarmingssysteem onderdelen
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
            
            {/* Content */}
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

            {/* Navigation buttons */}
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