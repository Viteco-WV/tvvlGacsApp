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
    {
      id: 'airconditioning_1',
      question: 'Wat is het type koelsysteem in het gebouw?',
      type: 'select',
      options: ['Split units', 'VRV/VRF systeem', 'Centrale airco', 'Chiller systeem', 'Geen koeling', 'Ander']
    },
    {
      id: 'airconditioning_2',
      question: 'Hoeveel koelunits zijn er geïnstalleerd?',
      type: 'number'
    },
    {
      id: 'airconditioning_3',
      question: 'Wat is de totale koelcapaciteit in kW?',
      type: 'number'
    },
    {
      id: 'airconditioning_4',
      question: 'Is er warmtepomp functionaliteit aanwezig?',
      type: 'select',
      options: ['Ja', 'Nee', 'Gedeeltelijk']
    },
    {
      id: 'airconditioning_5',
      question: 'Wat is de leeftijd van het koelsysteem?',
      type: 'select',
      options: ['0-5 jaar', '6-10 jaar', '11-15 jaar', '16-20 jaar', '20+ jaar']
    },
    {
      id: 'airconditioning_6',
      question: 'Is er een centraal regelsysteem aanwezig?',
      type: 'select',
      options: ['Ja', 'Nee']
    },
    {
      id: 'airconditioning_7',
      question: 'Zijn er thermostaten per ruimte?',
      type: 'select',
      options: ['Ja', 'Nee', 'Gedeeltelijk']
    },
    {
      id: 'airconditioning_8',
      question: 'Is er een onderhoudscontract voor het koelsysteem?',
      type: 'select',
      options: ['Ja', 'Nee']
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
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.airconditioning = answers;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
  };

  const handleNext = () => {
    handleSave();
    router.push('/opnamen/gebouwmanagement');
  };

  const handlePrevious = () => {
    handleSave();
    router.push('/opnamen/verlichting');
  };

  const renderQuestion = (question: any) => {
    const currentAnswer = answers[question.id] || '';

    switch (question.type) {
      case 'select':
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecteer een optie</option>
            {question.options.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
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
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
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
                {questions.length} vragen
              </div>
            </div>
            
            <div className="p-8">
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-[#343234] mb-4">
                      Vraag {index + 1}: {question.question}
                    </h3>
                    
                    <div className="mb-4">
                      {renderQuestion(question)}
                    </div>
                  </div>
                ))}
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