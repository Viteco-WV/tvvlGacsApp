'use client';

import { useRouter } from 'next/navigation';

export default function HeaderAdvanced() {
  const router = useRouter();

  const handleSave = () => {
    router.push('/opnamen');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <img 
                src="/logo-tvvl.png" 
                alt="TVVL Logo" 
                className="h-8 w-auto"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-800 absolute left-1/2 transform -translate-x-1/2">
              GACS audit app
            </h1>
            <div className="flex-shrink-0">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#c7d316] text-[#343234] rounded-md hover:bg-[#b3c014] transition-colors duration-200 text-sm font-bold"
              >
                Tussentijds opslaan
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

