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
    {
      id: 'heating_type',
      question: 'Welk type verwarmingssysteem is aanwezig?',
      type: 'select',
      options: ['CV-ketel', 'Warmtepomp', 'Stadsverwarming', 'Vloerverwarming', 'Radiatoren', 'Ander']
    },
    {
      id: 'heating_control',
      question: 'Is er een centrale regeling aanwezig?',
      type: 'radio',
      options: ['Ja', 'Nee']
    },
    {
      id: 'heating_zones',
      question: 'Hoeveel verwarmingszones zijn er?',
      type: 'number',
      min: 1,
      max: 20
    },
    {
      id: 'heating_efficiency',
      question: 'Wat is de verwachte efficiëntie van het systeem?',
      type: 'select',
      options: ['< 70%', '70-80%', '80-90%', '> 90%', 'Onbekend']
    },
    {
      id: 'heating_maintenance',
      question: 'Wanneer was de laatste onderhoudsbeurt?',
      type: 'date'
    },
    {
      id: 'heating_notes',
      question: 'Aanvullende opmerkingen over het verwarmingssysteem:',
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