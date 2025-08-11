'use client';

import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleSave = () => {
    router.push('/opnamen');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center">
            <div className="flex-1 flex justify-start">
              <img 
                src="/logo-tvvl.png" 
                alt="TVVL Logo" 
                className="h-8 w-auto"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">
              GACS audit app
            </h1>
            <div className="flex-1 flex justify-end">
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