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

export default function VentilatiePage() {
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  const questions = [
    // Sectie 1: Regeling van ventilatiestroom in de ruimte
    {
      id: 'ventilatiestroom_van_toepassing',
      question: 'Vraag 1.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '1 - Regeling van ventilatiestroom in de ruimte'
    },
    {
      id: 'ventilatiestroom_regeling',
      question: 'Vraag 1.2 - Hoe is de regeling van ventilatiestroom in de ruimte?',
      type: 'select',
      options: [
        'Geen automatische controle',
        'Tijd gestuurde regeling',
        'Aanwezigheidsdetectie',
        'Vraag gestuurde regeling'
      ],
      conditional: 'ventilatiestroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling van ventilatiestroom in de ruimte'
    },
    // Sectie 2: Temperatuurregeling in de ruimte (luchtsystemen)
    {
      id: 'temperatuur_lucht_van_toepassing',
      question: 'Vraag 2.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '2 - Temperatuurregeling in de ruimte (luchtsystemen)'
    },
    {
      id: 'temperatuur_lucht_regeling',
      question: 'Vraag 2.2 - Hoe is de temperatuurregeling in de ruimte (luchtsystemen)?',
      type: 'select',
      options: [
        'Aan-uit regeling',
        'Variabele regeling',
        'Vraag gestuurde regeling'
      ],
      conditional: 'temperatuur_lucht_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Temperatuurregeling in de ruimte (luchtsystemen)'
    },
    // Sectie 3: Temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)
    {
      id: 'temperatuur_gecombineerd_van_toepassing',
      question: 'Vraag 3.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '3 - Temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)'
    },
    {
      id: 'temperatuur_gecombineerd_regeling',
      question: 'Vraag 3.2 - Hoe is de temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)?',
      type: 'select',
      options: [
        'Geen afstemming',
        'Afstemming'
      ],
      conditional: 'temperatuur_gecombineerd_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)'
    },
    // Sectie 4: Buitenluchtstroom regeling
    {
      id: 'buitenluchtstroom_van_toepassing',
      question: 'Vraag 4.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '4 - Buitenluchtstroom regeling'
    },
    {
      id: 'buitenluchtstroom_regeling',
      question: 'Vraag 4.2 - Hoe is de buitenluchtstroom regeling?',
      type: 'select',
      options: [
        'Vaste verhouding buitenluchtstroom',
        'Tijd gestuurde getrapte regeling verhouding buitenlucht',
        'Vraag gestuurde getrapte regeling verhouding buitenlucht',
        'Variabele regeling'
      ],
      conditional: 'buitenluchtstroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Buitenluchtstroom regeling'
    },
    // Sectie 5: Luchtstroom of luchtdrukregeling van air handeling unit
    {
      id: 'luchtstroom_van_toepassing',
      question: 'Vraag 5.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '5 - Luchtstroom of luchtdrukregeling van air handeling unit'
    },
    {
      id: 'luchtstroom_regeling',
      question: 'Vraag 5.2 - Hoe is de luchtstroom of luchtdrukregeling van air handeling unit?',
      type: 'select',
      options: [
        'Geen automatische regeling',
        'Tijd gestuurde aan-uit regeling',
        'Multi stap regeling',
        'Automatische luchtstroom of drukregeling (met of zonder reset)'
      ],
      conditional: 'luchtstroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '5 - Luchtstroom of luchtdrukregeling van air handeling unit'
    },
    // Sectie 6: Warmte terugwinning: vorstbescherming
    {
      id: 'vorstbescherming_van_toepassing',
      question: 'Vraag 6.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '6 - Warmte terugwinning: vorstbescherming'
    },
    {
      id: 'vorstbescherming_regeling',
      question: 'Vraag 6.2 - Hoe is de warmte terugwinning vorstbescherming?',
      type: 'select',
      options: [
        'Zonder vorstbescherming',
        'Met vorstbescherming'
      ],
      conditional: 'vorstbescherming_van_toepassing',
      conditionalValue: 'Ja',
      section: '6 - Warmte terugwinning: vorstbescherming'
    },
    // Sectie 7: Warmte terugwinning: oververhitting bescherming
    {
      id: 'oververhitting_van_toepassing',
      question: 'Vraag 7.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '7 - Warmte terugwinning: oververhitting bescherming'
    },
    {
      id: 'oververhitting_regeling',
      question: 'Vraag 7.2 - Hoe is de warmte terugwinning oververhitting bescherming?',
      type: 'select',
      options: [
        'Zonder oververhitting bescherming',
        'Met oververhitting bescherming'
      ],
      conditional: 'oververhitting_van_toepassing',
      conditionalValue: 'Ja',
      section: '7 - Warmte terugwinning: oververhitting bescherming'
    },
    // Sectie 8: Vrije koeling
    {
      id: 'vrije_koeling_van_toepassing',
      question: 'Vraag 8.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '8 - Vrije koeling'
    },
    {
      id: 'vrije_koeling_regeling',
      question: 'Vraag 8.2 - Hoe is de vrije koeling geregeld?',
      type: 'select',
      options: [
        'Geen automatische regeling',
        'Nachtkoeling',
        'Vrije koeling',
        'HX gestuurde regeling (=modulerende regeling)'
      ],
      conditional: 'vrije_koeling_van_toepassing',
      conditionalValue: 'Ja',
      section: '8 - Vrije koeling'
    },
    // Sectie 9: Regeling ventilatie temperatuur
    {
      id: 'ventilatie_temperatuur_van_toepassing',
      question: 'Vraag 9.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '9 - Regeling ventilatie temperatuur'
    },
    {
      id: 'ventilatie_temperatuur_regeling',
      question: 'Vraag 9.2 - Hoe is de regeling ventilatie temperatuur?',
      type: 'select',
      options: [
        'Geen automatische controle',
        'Constante temperatuurinstelling',
        'Variabele temperatuurinstelling met buitentemperatuur correctie',
        'Variabele temperatuurinstelling met vraaggestuurde correctie'
      ],
      conditional: 'ventilatie_temperatuur_van_toepassing',
      conditionalValue: 'Ja',
      section: '9 - Regeling ventilatie temperatuur'
    },
    // Sectie 10: Regeling luchtvochtigheid
    {
      id: 'luchtvochtigheid_van_toepassing',
      question: 'Vraag 10.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '10 - Regeling luchtvochtigheid'
    },
    {
      id: 'luchtvochtigheid_regeling',
      question: 'Vraag 10.2 - Hoe is de regeling luchtvochtigheid?',
      type: 'select',
      options: [
        'Geen automatische controle',
        'Dauwpuntregeling',
        'Directe regeling luchtvochtigheid'
      ],
      conditional: 'luchtvochtigheid_van_toepassing',
      conditionalValue: 'Ja',
      section: '10 - Regeling luchtvochtigheid'
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
      if (parsedAnswers.ventilatie) {
        setAnswers(parsedAnswers.ventilatie);
      }
    }
  }, []);

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.ventilatie = newAnswers;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
  };

  const handleSave = () => {
    // Sla antwoorden op
    const allData = {
      ...answers,
      section: 'ventilatie',
      timestamp: new Date().toISOString()
    };
    
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.ventilatie = allData;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
  };

  const handleNext = () => {
    handleSave();
    router.push('/opnamen/verlichting');
  };

  const handlePrevious = () => {
    handleSave();
    router.push('/opnamen/airconditioning');
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
                  <span className="text-[#343234] font-bold text-lg">4</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Ventilatie onderdelen
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