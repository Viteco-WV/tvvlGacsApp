'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TimelineNavigation from '@/components/TimelineNavigation';
import Header from '@/components/Header';

interface BuildingData {
  buildingName: string;
  address: string;
  buildingType: string;
  energyLabel: string;
  contactPerson: string;
  date: string;
  photo?: string; // Base64 encoded photo
  postcode?: string;
  houseNumber?: string;
  houseAddition?: string;
  street?: string;
  city?: string;
  buildingArea?: number; // m2
}

interface AddressResult {
  openbareRuimteNaam: string;
  huisnummer: string;
  huisletter?: string;
  huisnummertoevoeging?: string;
  postcode: string;
  woonplaatsNaam: string;
  verblijfsobjectIdentificatie: string;
  oppervlakte?: number; // m2
}



export default function AlgemeenPage() {
  const [buildingData, setBuildingData] = useState<BuildingData>({
    buildingName: '',
    address: '',
    buildingType: '',
    energyLabel: '',
    contactPerson: '',
    date: new Date().toISOString().split('T')[0],
    postcode: '',
    houseNumber: '',
    houseAddition: '',
    street: '',
    city: '',
    buildingArea: undefined
  });
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [showAddressTable, setShowAddressTable] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBuildingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePostcodeLookup = async () => {
    if (!buildingData.postcode || !buildingData.houseNumber) {
      alert('Vul zowel postcode als huisnummer in');
      return;
    }

    setIsLoadingAddress(true);
    try {
      console.log('Zoeken naar adressen voor:', buildingData.postcode, buildingData.houseNumber, buildingData.houseAddition);
      
             // Probeer eerst BAG API, fallback naar mock data als het niet werkt
       try {
         // Bouw de parameters op zoals in de Python code
         const params = new URLSearchParams({
           postcode: buildingData.postcode,
           huisnummer: buildingData.houseNumber,
           exacteMatch: 'false',
           page: '1',
           pageSize: '20',
           inclusiefEindStatus: 'true'
         });
         
         // Voeg toevoeging toe als die is ingevuld
         if (buildingData.houseAddition) {
           params.append('huisnummertoevoeging', buildingData.houseAddition);
         }
         
         const response = await fetch(`https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2/adressenuitgebreid?${params.toString()}`, {
           headers: {
             'X-Api-Key': 'l788677df29fd64c17a521dd7d5d9b0d9a',
             'Accept': 'application/hal+json',
             'Accept-Crs': 'epsg:28992'
           }
         });
        
                 if (response.ok) {
           const data = await response.json();
           console.log('BAG API response:', data);
           
                       if (data._embedded && data._embedded.adressen && data._embedded.adressen.length > 0) {
              const addresses = data._embedded.adressen;
              
                                            // Transform BAG data naar ons formaat
               const transformedAddresses = addresses.map((addr: Record<string, unknown>) => ({
                 openbareRuimteNaam: (addr.openbareRuimte as Record<string, unknown>)?.openbareRuimteNaam as string || (addr.openbareRuimteNaam as string) || '',
                 huisnummer: addr.huisnummer as string,
                 huisletter: (addr.huisletter as string) || '',
                 huisnummertoevoeging: (addr.huisnummertoevoeging as string) || '',
                 postcode: addr.postcode as string,
                 woonplaatsNaam: (addr.woonplaats as Record<string, unknown>)?.woonplaatsNaam as string || (addr.woonplaatsNaam as string) || '',
                 verblijfsobjectIdentificatie: addr.verblijfsobjectIdentificatie as string,
                 oppervlakte: (addr.verblijfsobject as Record<string, unknown>)?.oppervlakte as number || null
               }));
             
             setAddressResults(transformedAddresses);
             setShowAddressTable(true);
             return;
           }
         }
      } catch (apiError) {
        console.log('BAG API niet beschikbaar, gebruik mock data:', apiError);
      }
      
      // Fallback naar mock data
      console.log('Gebruik mock data voor testen');
      const mockAddresses = [
        {
          openbareRuimteNaam: 'Korenmolenlaan',
          huisnummer: buildingData.houseNumber,
          huisletter: '',
          huisnummertoevoeging: '',
          postcode: buildingData.postcode,
          woonplaatsNaam: 'Amsterdam',
          verblijfsobjectIdentificatie: '123456789',
          oppervlakte: 1250
        },
        {
          openbareRuimteNaam: 'Korenmolenlaan',
          huisnummer: buildingData.houseNumber,
          huisletter: '',
          huisnummertoevoeging: 'A',
          postcode: buildingData.postcode,
          woonplaatsNaam: 'Amsterdam',
          verblijfsobjectIdentificatie: '123456790',
          oppervlakte: 850
        },
        {
          openbareRuimteNaam: 'Korenmolenlaan',
          huisnummer: buildingData.houseNumber,
          huisletter: '',
          huisnummertoevoeging: 'B',
          postcode: buildingData.postcode,
          woonplaatsNaam: 'Amsterdam',
          verblijfsobjectIdentificatie: '123456791',
          oppervlakte: 1100
        },
        {
          openbareRuimteNaam: 'Korenmolenlaan',
          huisnummer: buildingData.houseNumber,
          huisletter: '',
          huisnummertoevoeging: '2',
          postcode: buildingData.postcode,
          woonplaatsNaam: 'Amsterdam',
          verblijfsobjectIdentificatie: '123456792',
          oppervlakte: 950
        }
      ];
      
      // Filter op toevoeging als die is ingevuld
      let filteredAddresses = mockAddresses;
      if (buildingData.houseAddition) {
        filteredAddresses = mockAddresses.filter(addr => 
          addr.huisnummertoevoeging === buildingData.houseAddition
        );
      }
      
      setAddressResults(filteredAddresses);
      setShowAddressTable(true);
    } catch (error) {
      console.error('Error fetching address:', error);
      alert('Er is een fout opgetreden bij het ophalen van het adres.');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleAddressSelect = (address: AddressResult) => {
    const fullAddress = `${address.openbareRuimteNaam} ${address.huisnummer}${address.huisletter || ''}${address.huisnummertoevoeging || ''}, ${address.woonplaatsNaam}`;
    
    setBuildingData(prev => ({
      ...prev,
      address: fullAddress,
      postcode: address.postcode,
      houseNumber: address.huisnummer,
      houseAddition: address.huisnummertoevoeging || '',
      street: address.openbareRuimteNaam,
      city: address.woonplaatsNaam,
      buildingArea: address.oppervlakte
    }));
    
    setShowAddressTable(false);
    setAddressResults([]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBuildingData(prev => ({
          ...prev,
          photo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setBuildingData(prev => ({
      ...prev,
      photo: undefined
    }));
  };

  const handleStartOpnamen = () => {
    if (!buildingData.buildingName || !buildingData.address) {
      alert('Vul minimaal de gebouwnaam en adres in');
      return;
    }
    
    // Clear all existing data to start completely fresh
    localStorage.removeItem('gacsOpnamenData');
    localStorage.removeItem('gacsBuildingData');
    
    // Sla gebouwgegevens op in localStorage
    localStorage.setItem('gacsBuildingData', JSON.stringify(buildingData));
    router.push('/opnamen/verwarmingssysteem');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <TimelineNavigation />
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#c7d316]/10 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#c7d314] rounded-lg flex items-center justify-center">
                  <span className="text-[#343234] font-bold text-lg">1</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Algemene gegevens
                </h1>
              </div>
              <div className="bg-[#c7d316]/10 text-[#343234] px-3 py-1 rounded-full text-sm font-medium">
                Gebouwgegevens
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="buildingName" className="block text-sm font-medium text-[#343234] mb-2">
                    Gebouwnaam *
                  </label>
                  <input
                    type="text"
                    id="buildingName"
                    name="buildingName"
                    value={buildingData.buildingName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Voer de naam van het gebouw in"
                    required
                  />
                </div>

                {/* Postcode, huisnummer en toevoeging sectie */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="postcode" className="block text-sm font-medium text-[#343234] mb-2">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      id="postcode"
                      name="postcode"
                      value={buildingData.postcode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="1234 AB"
                      maxLength={7}
                    />
                  </div>
                  <div>
                    <label htmlFor="houseNumber" className="block text-sm font-medium text-[#343234] mb-2">
                      Huisnummer *
                    </label>
                    <input
                      type="text"
                      id="houseNumber"
                      name="houseNumber"
                      value={buildingData.houseNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label htmlFor="houseAddition" className="block text-sm font-medium text-[#343234] mb-2">
                      Toevoeging
                    </label>
                    <input
                      type="text"
                      id="houseAddition"
                      name="houseAddition"
                      value={buildingData.houseAddition}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="A, B, 2"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handlePostcodeLookup}
                      disabled={isLoadingAddress || !buildingData.postcode || !buildingData.houseNumber}
                      className="w-full px-3 py-2 bg-[#c7d316] text-[#343234] rounded-md hover:bg-[#b3c014] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingAddress ? 'Zoeken...' : 'Adres opzoeken'}
                    </button>
                  </div>
                </div>

                {/* Adres resultaten tabel */}
                {showAddressTable && addressResults.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-[#343234] mb-3">Gevonden adressen:</h3>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[#343234]">Straat</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[#343234]">Huisnummer</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[#343234]">Plaats</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[#343234]">Oppervlakte (m²)</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[#343234]">Actie</th>
                          </tr>
                        </thead>
                        <tbody>
                          {addressResults.map((address, index) => (
                            <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-[#343234]">
                                {address.openbareRuimteNaam}
                              </td>
                              <td className="px-4 py-2 text-sm text-[#343234]">
                                {address.huisnummer}{address.huisletter || ''}{address.huisnummertoevoeging || ''}
                              </td>
                              <td className="px-4 py-2 text-sm text-[#343234]">
                                {address.woonplaatsNaam}
                              </td>
                              <td className="px-4 py-2 text-sm text-[#343234]">
                                {address.oppervlakte ? `${address.oppervlakte} m²` : '-'}
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => handleAddressSelect(address)}
                                  className="px-3 py-1 bg-[#c7d316] text-[#343234] rounded-md hover:bg-[#b3c014] transition-colors duration-200 text-xs font-medium"
                                >
                                  Selecteren
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-[#343234] mb-2">
                    Adres *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={buildingData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Straatnaam en huisnummer, plaats"
                    required
                  />
                </div>

                {buildingData.buildingArea && (
                  <div>
                    <label htmlFor="buildingArea" className="block text-sm font-medium text-[#343234] mb-2">
                      Gebouw oppervlakte
                    </label>
                    <input
                      type="number"
                      id="buildingArea"
                      name="buildingArea"
                      value={buildingData.buildingArea}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Oppervlakte in m²"
                      readOnly
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="buildingType" className="block text-sm font-medium text-[#343234] mb-2">
                    Type gebouw
                  </label>
                  <select
                    id="buildingType"
                    name="buildingType"
                    value={buildingData.buildingType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  >
                    <option value="">Selecteer type gebouw</option>
                    <option value="kantoor">Kantoor</option>
                    <option value="winkel">Winkel</option>
                    <option value="school">School</option>
                    <option value="ziekenhuis">Ziekenhuis</option>
                    <option value="hotel">Hotel</option>
                    <option value="wooncomplex">Wooncomplex</option>
                    <option value="industrieel">Industrieel</option>
                    <option value="ander">Ander</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="energyLabel" className="block text-sm font-medium text-[#343234] mb-2">
                    Energielabel
                  </label>
                  <select
                    id="energyLabel"
                    name="energyLabel"
                    value={buildingData.energyLabel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  >
                    <option value="">Selecteer energielabel</option>
                    <option value="A+++">A+++</option>
                    <option value="A++">A++</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                    <option value="onbekend">Onbekend</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-[#343234] mb-2">
                    Contactpersoon
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={buildingData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Naam van de contactpersoon"
                  />
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-[#343234] mb-2">
                    Datum opnamen
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={buildingData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="photo" className="block text-sm font-medium text-[#343234] mb-2">
                    Foto van het pand
                  </label>
                  <div className="space-y-4">
                    {buildingData.photo ? (
                      <div className="relative">
                        <img 
                          src={buildingData.photo} 
                          alt="Gebouw foto" 
                          className="w-full h-48 object-cover rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                          title="Foto verwijderen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-2">
                          <label htmlFor="photo-upload" className="cursor-pointer">
                            <span className="text-sm font-medium text-[#343234] hover:text-green-500">
                              Klik om foto te uploaden
                            </span>
                            <span className="text-xs text-gray-500 block mt-1">
                              PNG, JPG, GIF tot 10MB
                            </span>
                          </label>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 flex flex-col gap-4 sm:flex-row justify-center">
                  <button
                    onClick={handleStartOpnamen}
                    className="w-full sm:w-auto bg-[#B7D840] text-[#222] py-3 px-6 rounded-md hover:bg-[#A0C52F] transition-colors duration-200 font-bold text-lg border border-[#B7D840] shadow-sm"
                  >
                    Start Opnamen
                  </button>
                  <button
                    onClick={() => router.push('/')} 
                    className="w-full sm:w-auto bg-white text-[#7BA800] py-3 px-6 rounded-md hover:bg-[#F3F9E6] border border-[#7BA800] transition-colors duration-200 font-medium text-lg"
                    type="button"
                  >
                    Terug naar start
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full sm:w-auto bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-lg"
                    type="button"
                  >
                    Reset All Data (Debug)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 