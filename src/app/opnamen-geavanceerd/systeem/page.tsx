'use client';

import { useRouter } from 'next/navigation';
import TimelineNavigationAdvanced from '@/components/TimelineNavigationAdvanced';
import HeaderAdvanced from '@/components/HeaderAdvanced';

export default function SysteemPage() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/opnamen-geavanceerd/details');
  };

  const handlePrevious = () => {
    router.push('/opnamen-geavanceerd/distributie');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <HeaderAdvanced />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <TimelineNavigationAdvanced />
          
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#c7d316]/10 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#c7d314] rounded-lg flex items-center justify-center">
                  <span className="text-[#343234] font-bold text-lg">5</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Systeem
                </h1>
              </div>
              <div className="bg-[#c7d316]/10 text-[#343234] px-3 py-1 rounded-full text-sm font-medium">
                Gebouwgegevens
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
          
          {/* Content area - Empty for now */}
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold mb-2">Systeem</h3>
              <p className="text-gray-400">Content wordt hier toegevoegd</p>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="pt-6 flex flex-col gap-4 sm:flex-row justify-center">
            <button
              onClick={handlePrevious}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              ← Vorige
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-[#c7d316] text-[#343234] rounded-lg hover:bg-[#b3c014] transition-colors duration-200 font-medium"
            >
              Volgende →
            </button>
          </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
