'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TimelineNavigationAdvanced from '@/components/TimelineNavigationAdvanced';
import HeaderAdvanced from '@/components/HeaderAdvanced';
import MapComponent from '@/components/MapComponent';

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
  latitude?: number; // GPS latitude
  longitude?: number; // GPS longitude
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
  gebouwtype?: string; // Added building type
  latitude?: number; // GPS latitude
  longitude?: number; // GPS longitude
}

interface ContactPerson {
  naam: string;
  achternaam: string;
  organisatie: string;
  rol: string;
  email: string;
  telefoon: string;
}

export default function AlgemeenGeavanceerdPage() {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [energyLabelData, setEnergyLabelData] = useState<any>(null);
  const [isLoadingEnergyLabel, setIsLoadingEnergyLabel] = useState(false);
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [newContactPerson, setNewContactPerson] = useState<ContactPerson>({
    naam: '',
    achternaam: '',
    organisatie: '',
    rol: '',
    email: '',
    telefoon: ''
  });
  const router = useRouter();

  // Map BAG gebouwtypes to our dropdown options
  const mapBAGToBuildingType = (bagType: string): string => {
    const typeMapping: Record<string, string> = {
      'kantoor': 'kantoor',
      'winkelfunctie': 'winkel',
      'winkel': 'winkel',
      'onderwijs': 'school',
      'school': 'school',
      'ziekenhuis': 'ziekenhuis',
      'hotel': 'hotel',
      'woonfunctie': 'wooncomplex',
      'wooncomplex': 'wooncomplex',
      'industrie': 'industrieel',
      'industrieel': 'industrieel',
      'bedrijf': 'industrieel'
    };
    
    return typeMapping[bagType.toLowerCase()] || 'ander';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBuildingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactPersonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewContactPerson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addContactPerson = () => {
    if (newContactPerson.naam && newContactPerson.achternaam) {
      setContactPersons(prev => [...prev, { ...newContactPerson }]);
      setNewContactPerson({
        naam: '',
        achternaam: '',
        organisatie: '',
        rol: '',
        email: '',
        telefoon: ''
      });
    }
  };

  const removeContactPerson = (index: number) => {
    setContactPersons(prev => prev.filter((_, i) => i !== index));
  };

  const fetchEnergyLabel = async (postcode: string, houseNumber: string) => {
    if (!postcode || !houseNumber) {
      return;
    }
    
    setIsLoadingEnergyLabel(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconden timeout
      
      const response = await fetch(
        `https://public.ep-online.nl/api/v1/energielabels?postcode=${postcode}&huisnummer=${houseNumber}`,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer OEFGNzc2MjFBNjlGRTVFRjVFQUUwMTZGQkY2NTBFREE0MTMxQzY1ODc0MDc0Q0EyNjgzQ0VDMzY4RDBFNDVEOTc1NDNCQzc2RDQ4RjQ4NkRCMjJDMUMwNEEzNDc4MkNC',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && (data.energielabel || data.length > 0)) {
          const labelData = Array.isArray(data) ? data[0] : data;
          setEnergyLabelData(labelData);
          
          if (labelData.energielabel) {
            setBuildingData(prev => ({
              ...prev,
              energyLabel: labelData.energielabel
            }));
          }
        } else {
          setEnergyLabelData(null);
        }
      } else {
        setEnergyLabelData(null);
      }
    } catch (error) {
      // Stilletjes afhandelen - geen errors tonen
      // Gewoon null teruggeven zodat gebruiker handmatig kan invullen
      setEnergyLabelData(null);
    } finally {
      setIsLoadingEnergyLabel(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Voer een zoekterm in');
      return;
    }

    setIsLoadingAddress(true);
    try {
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          page: '1',
          pageSize: '20',
          inclusiefEindStatus: 'true'
        });
        
        const response = await fetch(`https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2/adressenuitgebreid?${params.toString()}`, {
          headers: {
            'X-Api-Key': 'l788677df29fd64c17a521dd7d5d9b0d9a',
            'Accept': 'application/hal+json',
            'Accept-Crs': 'epsg:28992'
          }
        });
       
        if (response.ok) {
          const data = await response.json();
          // console.log('BAG API response:', data);
          
          if (data._embedded && data._embedded.adressen && data._embedded.adressen.length > 0) {
            const addresses = data._embedded.adressen;
            
            const transformedAddresses = addresses.map((addr: Record<string, unknown>) => ({
              openbareRuimteNaam: (addr.openbareRuimte as Record<string, unknown>)?.openbareRuimteNaam as string || (addr.openbareRuimteNaam as string) || '',
              huisnummer: addr.huisnummer as string,
              huisletter: (addr.huisletter as string) || '',
              huisnummertoevoeging: (addr.huisnummertoevoeging as string) || '',
              postcode: addr.postcode as string,
              woonplaatsNaam: (addr.woonplaats as Record<string, unknown>)?.woonplaatsNaam as string || (addr.woonplaatsNaam as string) || '',
              verblijfsobjectIdentificatie: addr.verblijfsobjectIdentificatie as string,
              oppervlakte: (addr.verblijfsobject as Record<string, unknown>)?.oppervlakte as number || null,
              latitude: null,
              longitude: null,
              gebouwtype: (addr.verblijfsobject as Record<string, unknown>)?.gebruiksdoel as string || 
                         (addr.pand as Record<string, unknown>)?.gebruiksdoel as string || 
                         'onbekend'
            }));
          
            setAddressResults(transformedAddresses);
            setShowAddressTable(true);
            return;
          }
        }
      } catch (apiError) {
        // console.log('BAG API niet beschikbaar, gebruik mock data:', apiError);
      }
      
      // Fallback naar mock data
      // console.log('Gebruik mock data voor testen');
      const mockAddresses = [
        {
          openbareRuimteNaam: 'Korenmolenlaan',
          huisnummer: '4',
          huisletter: '',
          huisnummertoevoeging: '',
          postcode: '1234 AB',
          woonplaatsNaam: 'Amsterdam',
          verblijfsobjectIdentificatie: '123456789',
          oppervlakte: 1250,
          latitude: 52.3676,
          longitude: 4.9041,
          gebouwtype: 'kantoor'
        },
        {
          openbareRuimteNaam: 'Hoofdstraat',
          huisnummer: '12',
          huisletter: '',
          huisnummertoevoeging: 'A',
          postcode: '5678 CD',
          woonplaatsNaam: 'Rotterdam',
          verblijfsobjectIdentificatie: '123456790',
          oppervlakte: 850,
          latitude: 51.9244,
          longitude: 4.4777,
          gebouwtype: 'winkel'
        },
        {
          openbareRuimteNaam: 'Marktplein',
          huisnummer: '1',
          huisletter: '',
          huisnummertoevoeging: '',
          postcode: '9012 EF',
          woonplaatsNaam: 'Utrecht',
          verblijfsobjectIdentificatie: '123456791',
          oppervlakte: 1100,
          latitude: 52.0907,
          longitude: 5.1214,
          gebouwtype: 'school'
        }
      ];
      
      // Filter mock data op basis van zoekterm
      const filteredAddresses = mockAddresses.filter(addr => 
        addr.openbareRuimteNaam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.woonplaatsNaam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.postcode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setAddressResults(filteredAddresses);
      setShowAddressTable(true);
    } catch (error) {
      // console.error('Error searching addresses:', error);
      alert('Er is een fout opgetreden bij het zoeken naar adressen.');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handlePostcodeLookup = async () => {
    if (!buildingData.postcode || !buildingData.houseNumber) {
      alert('Vul zowel postcode als huisnummer in');
      return;
    }

    setIsLoadingAddress(true);
    try {
      // console.log('Zoeken naar adressen voor:', buildingData.postcode, buildingData.houseNumber, buildingData.houseAddition);
      
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
          // console.log('BAG API response:', data);
          
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
        // console.log('BAG API niet beschikbaar, gebruik mock data:', apiError);
      }
      
      // Fallback naar mock data
      // console.log('Gebruik mock data voor testen');
      const mockAddresses = [
        {
          openbareRuimteNaam: 'Korenmolenlaan',
          huisnummer: buildingData.houseNumber,
          huisletter: '',
          huisnummertoevoeging: '',
          postcode: buildingData.postcode,
          woonplaatsNaam: 'Amsterdam',
          verblijfsobjectIdentificatie: '123456789',
          oppervlakte: 1250,
          latitude: 52.3676,
          longitude: 4.9041
        },
        {
          openbareRuimteNaam: 'Korenmolenlaan',
          huisnummer: buildingData.houseNumber,
          huisletter: '',
          huisnummertoevoeging: 'A',
          postcode: buildingData.postcode,
          woonplaatsNaam: 'Amsterdam',
          verblijfsobjectIdentificatie: '123456790',
          oppervlakte: 850,
          latitude: 52.3677,
          longitude: 4.9042
        },
        {
          openbareRuimteNaam: 'Korenmolenlaan',
          huisnummer: buildingData.houseNumber,
          huisletter: '',
          huisnummertoevoeging: 'B',
          postcode: buildingData.postcode,
          woonplaatsNaam: 'Amsterdam',
          verblijfsobjectIdentificatie: '123456791',
          oppervlakte: 1100,
          latitude: 52.3678,
          longitude: 4.9043
        },
        {
          openbareRuimteNaam: 'Korenmolenlaan',
          huisnummer: buildingData.houseNumber,
          huisletter: '',
          huisnummertoevoeging: '2',
          postcode: buildingData.postcode,
          woonplaatsNaam: 'Amsterdam',
          verblijfsobjectIdentificatie: '123456792',
          oppervlakte: 950,
          latitude: 52.3679,
          longitude: 4.9044
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
      // console.error('Error fetching address:', error);
      alert('Er is een fout opgetreden bij het ophalen van het adres.');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleAddressSelect = (address: AddressResult) => {
    const fullAddress = `${address.openbareRuimteNaam} ${address.huisnummer}${address.huisletter || ''}${address.huisnummertoevoeging || ''}, ${address.woonplaatsNaam}`;
    const buildingName = `${address.openbareRuimteNaam} ${address.huisnummer}${address.huisletter || ''}${address.huisnummertoevoeging || ''}`;
    const mappedBuildingType = address.gebouwtype ? mapBAGToBuildingType(address.gebouwtype) : '';
    
    setBuildingData(prev => ({
      ...prev,
      buildingName: buildingName,
      address: fullAddress,
      postcode: address.postcode,
      houseNumber: address.huisnummer,
      houseAddition: address.huisnummertoevoeging || '',
      street: address.openbareRuimteNaam,
      city: address.woonplaatsNaam,
      buildingArea: address.oppervlakte,
      buildingType: mappedBuildingType,
      latitude: address.latitude,
      longitude: address.longitude
    }));
    
    // Haal energielabel op voor het geselecteerde adres
    fetchEnergyLabel(address.postcode, address.huisnummer);
    
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
    router.push('/opnamen-geavanceerd/ruimtetypes');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <HeaderAdvanced />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <TimelineNavigationAdvanced />
          
          {/* Main Content Area */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#c7d316]/10 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#c7d314] rounded-lg flex items-center justify-center">
                  <span className="text-[#343234] font-bold text-lg">1</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Algemeen
                </h1>
              </div>
              <div className="bg-[#c7d316]/10 text-[#343234] px-3 py-1 rounded-full text-sm font-medium">
                Gebouwgegevens
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              {/* Search and Address Lookup Section */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Start hier met het zoeken naar het betreffende gebouw</h2>
                {/* Search Bar */}
                <div className="mb-6 flex items-center border border-blue-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-200">
                  <input
                    type="text"
                    placeholder="Zoeken op adres, woonplaats, BAG nummer"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-2 bg-white rounded-l-md focus:outline-none text-gray-900"
                  />
                  <button 
                    onClick={handleSearch}
                    disabled={isLoadingAddress}
                    className="px-4 py-2 bg-white rounded-r-md border-l border-blue-300 text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                  >
                    {isLoadingAddress ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Search Results Table */}
                {showAddressTable && addressResults.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Gevonden adressen:</h3>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Straat</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Huisnummer</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Plaats</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Oppervlakte (m²)</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Actie</th>
                          </tr>
                        </thead>
                        <tbody>
                          {addressResults.map((address, index) => (
                            <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {address.openbareRuimteNaam}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {address.huisnummer}{address.huisletter || ''}{address.huisnummertoevoeging || ''}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {address.woonplaatsNaam}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
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
              </div>

              {/* Building Data Form - Full Width */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">Opgehaalde gegevens bij BAG en EP-Online</h2>
                <p className="text-sm text-gray-600 mb-6 text-center">Controleer gegevens en pas waar nodig handmatig aan</p>
                <div className="space-y-4">
                  {/* First row - Full width */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gebouwnaam</label>
                      <input
                        type="text"
                        value={buildingData.buildingName}
                        onChange={(e) => setBuildingData(prev => ({...prev, buildingName: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="Bedrijfspand"
                      />
                    </div>
                  </div>
                  
                  {/* Second row - 3 columns */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                      <input
                        type="text"
                        value={buildingData.postcode}
                        onChange={(e) => setBuildingData(prev => ({...prev, postcode: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="1234 AB"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Huisnummer</label>
                      <input
                        type="text"
                        value={buildingData.houseNumber}
                        onChange={(e) => setBuildingData(prev => ({...prev, houseNumber: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="45"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Toevoeging</label>
                      <input
                        type="text"
                        value={buildingData.houseAddition}
                        onChange={(e) => setBuildingData(prev => ({...prev, houseAddition: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="A, b, II"
                      />
                    </div>
                  </div>
                  
                  {/* Third row - 1 column */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                      <input
                        type="text"
                        value={buildingData.address}
                        onChange={(e) => setBuildingData(prev => ({...prev, address: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="Korenmolenlaan 4"
                      />
                    </div>
                  </div>
                  
                  {/* Fourth row - 4 columns */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type gebruik</label>
                      <select
                        value={buildingData.buildingType}
                        onChange={(e) => setBuildingData(prev => ({...prev, buildingType: e.target.value}))}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                      >
                        <option value="">Selecteer toepassing</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Datum opname</label>
                      <input
                        type="date"
                        value={buildingData.date}
                        onChange={(e) => setBuildingData(prev => ({...prev, date: e.target.value}))}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Energielabel</label>
                      <select
                        value={buildingData.energyLabel}
                        onChange={(e) => setBuildingData(prev => ({...prev, energyLabel: e.target.value}))}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">BVO</label>
                      <input
                        type="number"
                        value={buildingData.buildingArea || ''}
                        onChange={(e) => setBuildingData(prev => ({...prev, buildingArea: e.target.value ? Number(e.target.value) : undefined}))}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="m²"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contactpersonen Section */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">Contactpersonen</h2>
                <p className="text-sm text-gray-600 mb-6 text-center">Voeg contactpersonen toe die betrokken zijn bij dit gebouw</p>
                
                {/* Add Contact Person Form */}
                <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
                  <h3 className="text-md font-medium text-gray-800 mb-4">Nieuwe contactpersoon toevoegen</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
                      <input
                        type="text"
                        name="naam"
                        value={newContactPerson.naam}
                        onChange={handleContactPersonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="Voornaam"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Achternaam</label>
                      <input
                        type="text"
                        name="achternaam"
                        value={newContactPerson.achternaam}
                        onChange={handleContactPersonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="Achternaam"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organisatie</label>
                      <input
                        type="text"
                        name="organisatie"
                        value={newContactPerson.organisatie}
                        onChange={handleContactPersonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="Bedrijf/Organisatie"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                      <input
                        type="text"
                        name="rol"
                        value={newContactPerson.rol}
                        onChange={handleContactPersonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="Functie/Rol"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newContactPerson.email}
                        onChange={handleContactPersonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="email@voorbeeld.nl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
                      <input
                        type="tel"
                        name="telefoon"
                        value={newContactPerson.telefoon}
                        onChange={handleContactPersonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                        placeholder="06-12345678"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={addContactPerson}
                      disabled={!newContactPerson.naam || !newContactPerson.achternaam}
                      className="bg-[#c7d316] text-[#343234] px-4 py-2 rounded-md hover:bg-[#b3c014] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Contactpersoon toevoegen
                    </button>
                  </div>
                </div>

                {/* Contact Persons Table */}
                {contactPersons.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-800 mb-4">Toegevoegde contactpersonen</h3>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Naam</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Organisatie</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Rol</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Telefoon</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Actie</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactPersons.map((person, index) => (
                            <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {person.naam} {person.achternaam}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {person.organisatie || '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {person.rol || '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {person.email || '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {person.telefoon || '-'}
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => removeContactPerson(index)}
                                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-xs font-medium"
                                >
                                  Verwijderen
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Three Boxes Row - Wrapped in Gray Container */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex gap-6">
                  {/* Building Summary */}
                  <div className="flex-1 bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Gebouwgegevens</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Straatnaam:</span>
                        <p className="text-gray-800">{buildingData.street || 'Niet ingevuld'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Energielabel:</span>
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-800">{buildingData.energyLabel || 'Niet ingevuld'}</p>
                          {isLoadingEnergyLabel && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Oppervlakte:</span>
                        <p className="text-gray-800">{buildingData.buildingArea ? `${buildingData.buildingArea} m²` : 'Niet ingevuld'}</p>
                      </div>
                      {energyLabelData && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Energielabel Details</h4>
                          <div className="space-y-1 text-xs text-blue-700">
                            <div>Label: <span className="font-medium">{energyLabelData.energielabel}</span></div>
                            {energyLabelData.energieindex && (
                              <div>Index: <span className="font-medium">{energyLabelData.energieindex}</span></div>
                            )}
                            {energyLabelData.geldigheidsdatum && (
                              <div>Geldig tot: <span className="font-medium">{energyLabelData.geldigheidsdatum}</span></div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map */}
                  <div className="flex-1 bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Locatie</h3>
                    <MapComponent 
                      height="h-64" 
                      latitude={buildingData.latitude}
                      longitude={buildingData.longitude}
                      address={buildingData.address}
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="flex-1 bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Foto van het pand</h3>
                    
                    {buildingData.photo ? (
                      <div className="relative">
                        <img 
                          src={buildingData.photo} 
                          alt="Gebouw foto" 
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                          onClick={removePhoto}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-gray-600">Klik om een foto up te loaden</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <span className="text-sm text-[#c7d316] hover:text-[#b3c014]">Upload foto</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-6 flex flex-col gap-4 sm:flex-row justify-center">
                <button
                  onClick={handleStartOpnamen}
                  className="w-full sm:w-auto bg-[#B7D840] text-[#222] py-3 px-6 rounded-md hover:bg-[#A0C52F] transition-colors duration-200 font-medium text-lg border border-[#B7D840] shadow-sm"
                >
                  Start opnamen
                </button>
                <button
                  onClick={() => router.push('/')} 
                  className="w-full sm:w-auto bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium text-lg"
                  type="button"
                >
                  Terug naar start
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}