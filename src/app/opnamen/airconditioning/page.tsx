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

export default function AirconditioningPage() {
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  const questions = [
    // Sectie 1: Regeling afgifte-unit (koude-paneel, fancoil unit, binnen unit airco)
    {
      id: 'afgifte_unit_van_toepassing',
      question: 'Vraag 1.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '1 - Regeling afgifte-unit (koude-paneel, fancoil unit, binnen unit airco)'
    },
    {
      id: 'afgifte_unit_regeling',
      question: 'Vraag 1.2 - Hoe wordt de temperatuurregeling geregeld?',
      type: 'select',
      options: [
        'Geen automatische temperatuurregeling',
        'Centrale automatische temperatuurregeling',
        'Individuele temperatuurregeling per ruimte',
        'Individuele temperatuurregeling per ruimte met communicatie naar centraal systeem',
        'Individuele temperatuurregeling per ruimte met communicatie en aanwezigheidsdetectie'
      ],
      conditional: 'afgifte_unit_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling afgifte-unit (koude-paneel, fancoil unit, binnen unit airco)'
    },
    // Sectie 2: Regeling afgifte-unit bij thermisch geactiveerde gebouw structuren
    {
      id: 'thermisch_geactiveerd_van_toepassing',
      question: 'Vraag 2.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '2 - Regeling afgifte-unit bij thermisch geactiveerde gebouw structuren'
    },
    {
      id: 'thermisch_geactiveerd_regeling',
      question: 'Vraag 2.2 - Hoe wordt de temperatuurregeling geregeld?',
      type: 'select',
      options: [
        'Geen automatische temperatuurregeling',
        'Centrale automatische temperatuurregeling',
        'Geavanceerde centrale temperatuur regeling',
        'Geavanceerde centrale temperatuur regeling met niet continue gebruik en/of ruimtetemperatuur terugkoppeling'
      ],
      conditional: 'thermisch_geactiveerd_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Regeling afgifte-unit bij thermisch geactiveerde gebouw structuren'
    },
    // Sectie 3: Regeling van watertemperatuur in het distributie netwerk (aanvoer of retour)
    {
      id: 'watertemperatuur_van_toepassing',
      question: 'Vraag 3.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '3 - Regeling van watertemperatuur in het distributie netwerk (aanvoer of retour)'
    },
    {
      id: 'watertemperatuur_regeling',
      question: 'Vraag 3.2 - Hoe is de watertemperatuur geregeld?',
      type: 'select',
      options: [
        'Geen automatische temperatuurregeling',
        'Buitentemperatuur-compensatie regeling',
        'Vraag gestuurde compensatieregeling'
      ],
      conditional: 'watertemperatuur_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Regeling van watertemperatuur in het distributie netwerk (aanvoer of retour)'
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
        'Variabele snelheid regeling (inter/extern)'
      ],
      conditional: 'distributiepompen_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Regeling van distributiepompen'
    },
    // Sectie 5: Hydraulisch gebalanceerd koudedistributie
    {
      id: 'koudedistributie_van_toepassing',
      question: 'Vraag 5.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '5 - Hydraulisch gebalanceerd koudedistributie'
    },
    {
      id: 'koudedistributie_regeling',
      question: 'Vraag 5.2 - Hoe is de koudedistributie gebalanceerd?',
      type: 'select',
      options: [
        'Niet gebalanceerd',
        'Statisch gebalanceerd per afnemer zonder groep balans',
        'Statisch gebalanceerd per afnemer en statisch groep balans',
        'Statisch gebalanceerd per afnemer en dynamisch groep balans',
        'Dynamisch gebalanceerd per afnemer'
      ],
      conditional: 'koudedistributie_van_toepassing',
      conditionalValue: 'Ja',
      section: '5 - Hydraulisch gebalanceerd koudedistributie'
    },
    // Sectie 6: Aan-uit regeling van koelsystemen
    {
      id: 'koelsystemen_van_toepassing',
      question: 'Vraag 6.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '6 - Aan-uit regeling van koelsystemen'
    },
    {
      id: 'koelsystemen_regeling',
      question: 'Vraag 6.2 - Hoe is de aan-uit regeling van koelsystemen geregeld?',
      type: 'select',
      options: [
        'Geen automatische regeling',
        'Automatische regeling met timer',
        'Automatische regeling met start-stop optimalisatie',
        'Automatische vraag gestuurde regeling'
      ],
      conditional: 'koelsystemen_van_toepassing',
      conditionalValue: 'Ja',
      section: '6 - Aan-uit regeling van koelsystemen'
    },
    // Sectie 7: Interlock tussen verwarming en koeling
    {
      id: 'interlock_van_toepassing',
      question: 'Vraag 7.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '7 - Interlock tussen verwarming en koeling'
    },
    {
      id: 'interlock_regeling',
      question: 'Vraag 7.2 - Hoe is de interlock geregeld?',
      type: 'select',
      options: [
        'Geen interlock',
        'Gedeeltelijke interlock',
        'Volledige interlock'
      ],
      conditional: 'interlock_van_toepassing',
      conditionalValue: 'Ja',
      section: '7 - Interlock tussen verwarming en koeling'
    },
    // Sectie 8: Regeling van koude-opwekkers
    {
      id: 'koude_opwekkers_van_toepassing',
      question: 'Vraag 8.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '8 - Regeling van koude-opwekkers'
    },
    {
      id: 'koude_opwekkers_regeling',
      question: 'Vraag 8.2 - Hoe is de regeling van de koude-opwekkers?',
      type: 'select',
      options: [
        'Vaste temperatuurinstelling',
        'Variabele temperatuurinstelling gebaseerd op buitentemperatuur',
        'Vraag-gestuurde variabele temperatuurinstelling'
      ],
      conditional: 'koude_opwekkers_van_toepassing',
      conditionalValue: 'Ja',
      section: '8 - Regeling van koude-opwekkers'
    },
    // Sectie 9: Volgorde van koude-opwekkers
    {
      id: 'volgorde_koude_opwekkers_van_toepassing',
      question: 'Vraag 9.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '9 - Volgorde van koude-opwekkers'
    },
    {
      id: 'volgorde_koude_opwekkers_regeling',
      question: 'Vraag 9.2 - Hoe is de volgorde van de koude-opwekkers geregeld?',
      type: 'select',
      options: [
        'Prioritering alleen op basis van draaiuren',
        'Prioritering gebaseerd op belasting (koudevraag)',
        'Dynamische prioritering gebaseerd op efficiency en karakteristieken van de toestellen',
        'Vraag-gestuurde prioritering (gebaseerd op meerdere parameters)'
      ],
      conditional: 'volgorde_koude_opwekkers_van_toepassing',
      conditionalValue: 'Ja',
      section: '9 - Volgorde van koude-opwekkers'
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
      if (parsedAnswers.airconditioning) {
        setAnswers(parsedAnswers.airconditioning);
      }
    }
  }, []);

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.airconditioning = newAnswers;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
  };

  const handleSave = () => {
    // Sla antwoorden op
    const allData = {
      ...answers,
      section: 'airconditioning',
      timestamp: new Date().toISOString()
    };
    
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.airconditioning = allData;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
  };

  const handleNext = () => {
    handleSave();
    router.push('/opnamen/ventilatie');
  };

  const handlePrevious = () => {
    handleSave();
    router.push('/opnamen/warm-tapwater');
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
                  <span className="text-[#343234] font-bold text-lg">3</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Koeling systeem onderdelen
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