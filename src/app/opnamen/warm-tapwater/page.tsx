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
    {
      id: 'hot_water_type',
      question: 'Welk type warm tapwater systeem is aanwezig?',
      type: 'select',
      options: ['Combi-ketel', 'Aparte boiler', 'Warmtepomp boiler', 'Zonneboiler', 'Stadsverwarming', 'Ander']
    },
    {
      id: 'hot_water_capacity',
      question: 'Wat is de capaciteit van het warm tapwater systeem?',
      type: 'select',
      options: ['< 100 liter', '100-200 liter', '200-500 liter', '500-1000 liter', '> 1000 liter', 'Onbekend']
    },
    {
      id: 'hot_water_temperature',
      question: 'Wat is de ingestelde temperatuur van het warm tapwater?',
      type: 'number',
      min: 40,
      max: 90,
      unit: '°C'
    },
    {
      id: 'hot_water_circulation',
      question: 'Is er een circulatiesysteem aanwezig?',
      type: 'radio',
      options: ['Ja', 'Nee']
    },
    {
      id: 'hot_water_legionella',
      question: 'Is er legionella preventie aanwezig?',
      type: 'radio',
      options: ['Ja', 'Nee', 'Onbekend']
    },
    {
      id: 'hot_water_maintenance',
      question: 'Wanneer was de laatste onderhoudsbeurt?',
      type: 'date'
    },
    {
      id: 'hot_water_notes',
      question: 'Aanvullende opmerkingen over het warm tapwater systeem:',
      type: 'textarea'
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
                <span>{option}</span>
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
                {questions.length} vragen
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              {/* All Questions */}
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id as string} className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-[#343234] mb-4">
                      Vraag {index + 1}: {question.question}
                    </h3>
                    
                    <div className="mb-4">
                      {renderQuestion(question)}
                    </div>
                  </div>
                ))}
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