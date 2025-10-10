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

export default function ZonweringPage() {
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  const questions = [
    // Sectie 1: Regeling zonwering
    {
      id: 'regeling_zonwering_van_toepassing',
      question: 'Vraag 1.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '1 - Regeling zonwering'
    },
    {
      id: 'regeling_zonwering_type',
      question: 'Vraag 1.2 - Hoe is de regeling zonwering?',
      type: 'select',
      options: [
        'Handmatige bediening',
        'Handmatige bediening met motor',
        'Automatisch regeling met motor',
        'Gecombineerde verlichting / zonwering / verwarming en koeling regeling'
      ],
      conditional: 'regeling_zonwering_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling zonwering'
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
      if (parsedAnswers.zonwering) {
        setAnswers(parsedAnswers.zonwering);
      }
    }
  }, []);

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.zonwering = newAnswers;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
  };

  const handleSave = () => {
    // Sla antwoorden op
    const allData = {
      ...answers,
      section: 'zonwering',
      timestamp: new Date().toISOString()
    };
    
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.zonwering = allData;
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
                  <span className="text-[#343234] font-bold text-lg">6</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Zonweringssystemen onderdelen
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