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

export default function WarmTapwaterPage() {
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  // Vragen voor warm tapwater
  const questions = [
    // Sectie 1: Regeling van elektrische of warmtepomp boiler
    {
      id: 'elektrische_boiler_van_toepassing',
      question: 'Vraag 1.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '1 - Regeling van elektrische of warmtepomp boiler'
    },
    {
      id: 'elektrische_boiler_regeling',
      question: 'Vraag 1.2 - Hoe is de regeling van de elektrische of warmtepomp boiler?',
      type: 'select',
      options: [
        'Automatische aan-uit regeling',
        'Automatische aan-uit regeling met tijdgestuurde opwarming',
        'Automatische aan-uit regeling met tijdgestuurde opwarming en multi-sensor regeling van warm wateropslag'
      ],
      conditional: 'elektrische_boiler_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling van elektrische of warmtepomp boiler'
    },    {
      id: 'elektrische_boiler_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'elektrische_boiler_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling van elektrische of warmtepomp boiler'
    },
    {
      id: 'elektrische_boiler_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'elektrische_boiler_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling van elektrische of warmtepomp boiler'
    },

    {
      id: 'elektrische_boiler_verbetermaatregel',
      question: 'Vraag 1.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'elektrische_boiler_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling van elektrische of warmtepomp boiler'
    },
    // Sectie 2: Regeling van warmwater-opslag met externe warm wateropwekking
    {
      id: 'warmwater_opslag_van_toepassing',
      question: 'Vraag 2.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '2 - Regeling van warmwater-opslag met externe warm wateropwekking'
    },
    {
      id: 'warmwater_opslag_regeling',
      question: 'Vraag 2.2 - Hoe is de regeling van de warmwater-opslag met externe warm wateropwekking?',
      type: 'select',
      options: [
        'Automatische aan-uit regeling',
        'Automatische aan-uit regeling met tijdgestuurde opwarming',
        'Automatische aan-uit regeling met tijdgestuurde opwarming en vraag gestuurde multi-sensor regeling van warm wateropslag'
      ],
      conditional: 'warmwater_opslag_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Regeling van warmwater-opslag met externe warm wateropwekking'
    },    {
      id: 'warmwater_opslag_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'warmwater_opslag_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Regeling van warmwater-opslag met externe warm wateropwekking'
    },
    {
      id: 'warmwater_opslag_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'warmwater_opslag_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Regeling van warmwater-opslag met externe warm wateropwekking'
    },

    {
      id: 'warmwater_opslag_verbetermaatregel',
      question: 'Vraag 2.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'warmwater_opslag_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Regeling van warmwater-opslag met externe warm wateropwekking'
    },
    // Sectie 3: Regeling van zonneboiler met back-up warmteopwekker
    {
      id: 'zonneboiler_van_toepassing',
      question: 'Vraag 3.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '3 - Regeling van zonneboiler met back-up warmteopwekker'
    },
    {
      id: 'zonneboiler_regeling',
      question: 'Vraag 3.2 - Hoe is de regeling van de zonneboiler met back-up warmteopwekker?',
      type: 'select',
      options: [
        'Handmatige regeling',
        'Automatische regeling met zon-thermische opwekking (prioriteit 1) en additionele opwekking (prioriteit 2)',
        'Automatische regeling met zon-thermische opwekking (prioriteit 1) en additionele opwekking (prioriteit 2) met vraag-gestuurde temperatuurregeling'
      ],
      conditional: 'zonneboiler_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Regeling van zonneboiler met back-up warmteopwekker'
    },    {
      id: 'zonneboiler_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'zonneboiler_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Regeling van zonneboiler met back-up warmteopwekker'
    },
    {
      id: 'zonneboiler_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'zonneboiler_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Regeling van zonneboiler met back-up warmteopwekker'
    },

    {
      id: 'zonneboiler_verbetermaatregel',
      question: 'Vraag 3.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'zonneboiler_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Regeling van zonneboiler met back-up warmteopwekker'
    },
    // Sectie 4: Regeling van warm tapwater distributiepomp
    {
      id: 'distributiepomp_van_toepassing',
      question: 'Vraag 4.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '4 - Regeling van warm tapwater distributiepomp'
    },
    {
      id: 'distributiepomp_regeling',
      question: 'Vraag 4.2 - Hoe is de regeling van de warm tapwater distributiepomp?',
      type: 'select',
      options: [
        'Geen regeling (continue bedrijf)',
        'Timer gestuurd'
      ],
      conditional: 'distributiepomp_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Regeling van warm tapwater distributiepomp'
    },
    {
      id: 'distributiepomp_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'distributiepomp_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Regeling van warm tapwater distributiepomp'
    },
    {
      id: 'distributiepomp_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'distributiepomp_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Regeling van warm tapwater distributiepomp'
    },

        {
      id: 'distributiepomp_verbetermaatregel',
      question: 'Vraag 4.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'distributiepomp_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Regeling van warm tapwater distributiepomp'
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
      if (data.warmTapwater) {
        setAnswers(data.warmTapwater);
      }
    }
  }, [router]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSave = () => {
    // Sla antwoorden op
    const allData = {
      ...answers,
      section: 'warm_tapwater',
      timestamp: new Date().toISOString()
    };
    
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.warmTapwater = allData;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
  };

  const handleNext = () => {
    handleSave();
    router.push('/opnamen/airconditioning');
  };

  const handlePrevious = () => {
    router.push('/opnamen/verwarmingssysteem');
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
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
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
              <label key={option} className="flex items-center space-x-2 font-bold">
                <input
                  type="radio"
                  name={question.id as string}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
                  className="text-[#343234] focus:ring-green-500"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <div className="flex items-center space-x-2 font-bold">
            <input
              type="number"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
              min={question.min as number}
              max={question.max as number}
              className="flex-1 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {(question.unit as string) && <span className="text-gray-600">{question.unit as string}</span>}
          </div>
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
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            placeholder="Voer uw antwoord in..."
          />
        );

            case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    handleAnswerChange(question.id as string, event.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900"
            />
            {currentAnswer && (
              <div className="mt-2 relative">
                <img 
                  src={currentAnswer} 
                  alt="Uploaded" 
                  className="max-w-xs h-32 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => handleAnswerChange(question.id as string, '')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                  title="Verwijder foto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
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
          {/* Timeline Navigation - Above the box */}
          <TimelineNavigation />
          
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#c7d316]/10 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#c7d314] rounded-lg flex items-center justify-center">
                  <span className="text-[#343234] font-bold text-lg">3</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Warm tapwater onderdelen
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
                    <div key={sectionName} className="pb-6 border-b border-gray-200">
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