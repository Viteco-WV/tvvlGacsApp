'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TimelineNavigation from '@/components/TimelineNavigation';
import Header from '@/components/Header';
import { useOpnameId } from '@/lib/useOpname';
import { uploadOpnameFoto, updateOpname, deleteOpnameFoto } from '@/lib/opname-api';

interface BuildingData {
  buildingName: string;
  address: string;
  buildingType: string;
  energyLabel: string;
  contactPerson: string;
  date: string;
  photo?: string;
  postcode?: string;
  houseNumber?: string;
  houseAddition?: string;
  street?: string;
  city?: string;
  buildingArea?: number;
}

interface AddressResult {
  openbareRuimteNaam: string;
  huisnummer: string;
  huisletter?: string;
  huisnummertoevoeging?: string;
  postcode: string;
  woonplaatsNaam: string;
  verblijfsobjectIdentificatie: string;
  oppervlakte?: number;
}

export default function AlgemeenPage() {
  const params = useParams();
  const opnameId = params?.id as string;
  const router = useRouter();
  const [, setOpnameId] = useOpnameId();
  
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
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [existingFotoId, setExistingFotoId] = useState<string | null>(null);

  // Laad bestaande opname data
  useEffect(() => {
    if (opnameId) {
      setOpnameId(opnameId);
      loadOpnameData(opnameId);
    } else {
      setIsLoading(false);
    }
  }, [opnameId]);

  const loadOpnameData = async (id: string) => {
    try {
      const response = await fetch(`/api/opnamen/${id}`);
      if (response.ok) {
        const opname = await response.json();
        setBuildingData({
          buildingName: opname.gebouwnaam || '',
          address: opname.adres || '',
          buildingType: opname.gebouwtype || '',
          energyLabel: opname.energielabel || '',
          contactPerson: opname.contactpersoon || '',
          date: opname.datum_opname ? new Date(opname.datum_opname).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          postcode: opname.postcode || '',
          houseNumber: opname.huisnummer || '',
          houseAddition: opname.huisnummertoevoeging || '',
          street: opname.straat || '',
          city: opname.stad || '',
          buildingArea: opname.gebouw_oppervlakte || undefined,
        });
        
        // Laad gebouwfoto als die er is
        if (opname.fotos && opname.fotos.length > 0) {
          const gebouwFoto = opname.fotos.find((f: { foto_type: string }) => f.foto_type === 'gebouw');
          if (gebouwFoto && gebouwFoto.bestandspad) {
            // Foto wordt getoond via bestandspad (verwijder public/ prefix)
            setBuildingData(prev => ({
              ...prev,
              photo: gebouwFoto.bestandspad.replace(/^public\//, '/')
            }));
            // Sla fotoId op voor later verwijderen
            if (gebouwFoto.id) {
              setExistingFotoId(gebouwFoto.id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Fout bij laden opname data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBuildingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Voer een zoekterm in');
      return;
    }

    setIsLoadingAddress(true);
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
        
        if (data._embedded && data._embedded.adressen && data._embedded.adressen.length > 0) {
          const addresses = data._embedded.adressen;
          const formattedAddresses: AddressResult[] = addresses.map((addr: any) => ({
            openbareRuimteNaam: (addr.openbareRuimte as Record<string, unknown>)?.openbareRuimteNaam as string || 
                                (addr.openbareRuimteNaam as string) || '',
            huisnummer: (addr.nummeraanduiding as Record<string, unknown>)?.huisnummer as string || 
                       (addr.huisnummer as string) || '',
            huisletter: (addr.nummeraanduiding as Record<string, unknown>)?.huisletter as string || 
                       (addr.huisletter as string) || '',
            huisnummertoevoeging: (addr.nummeraanduiding as Record<string, unknown>)?.huisnummertoevoeging as string || 
                                (addr.huisnummertoevoeging as string) || '',
            postcode: addr.postcode || '',
            woonplaatsNaam: (addr.woonplaats as Record<string, unknown>)?.woonplaatsNaam as string || 
                          (addr.woonplaatsNaam as string) || '',
            verblijfsobjectIdentificatie: addr.identificatie || addr.verblijfsobjectIdentificatie || '',
            oppervlakte: (addr.verblijfsobject as Record<string, unknown>)?.oppervlakte as number || 
                        addr.oppervlakte || undefined
          }));
          
          setAddressResults(formattedAddresses);
          setShowAddressTable(true);
        } else {
          alert('Geen adressen gevonden');
          setAddressResults([]);
          setShowAddressTable(false);
        }
      } else {
        alert('Fout bij zoeken naar adressen');
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      alert('Fout bij zoeken naar adressen');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleAddressSelect = (address: AddressResult) => {
    const fullAddress = `${address.openbareRuimteNaam} ${address.huisnummer}${address.huisletter || ''}${address.huisnummertoevoeging ? '-' + address.huisnummertoevoeging : ''}, ${address.woonplaatsNaam}`;
    const defaultBuildingName = `${address.openbareRuimteNaam} ${address.huisnummer}${address.huisletter || ''}${address.huisnummertoevoeging ? '-' + address.huisnummertoevoeging : ''}, ${address.woonplaatsNaam}`;
    
    setBuildingData(prev => {
      const updated = {
        ...prev,
        address: fullAddress,
        postcode: address.postcode,
        houseNumber: address.huisnummer,
        houseAddition: address.huisnummertoevoeging || '',
        street: address.openbareRuimteNaam,
        city: address.woonplaatsNaam,
        buildingArea: address.oppervlakte || prev.buildingArea,
        // Auto-vul gebouwnaam alleen als die leeg is, anders behoud de bestaande waarde
        buildingName: prev.buildingName && prev.buildingName.trim() !== '' 
          ? prev.buildingName 
          : defaultBuildingName
      };
      return updated;
    });
    
    setShowAddressTable(false);
    setSearchQuery('');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBuildingData(prev => ({
          ...prev,
          photo: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = async () => {
    // Verwijder foto uit database als opnameId beschikbaar is
    if (opnameId && existingFotoId) {
      try {
        await deleteOpnameFoto(opnameId, existingFotoId);
        setExistingFotoId(null);
      } catch (error) {
        console.error('Fout bij verwijderen foto uit database:', error);
        // Ga door met verwijderen uit state
      }
    }
    
    // Verwijder uit state
    setBuildingData(prev => ({
      ...prev,
      photo: undefined
    }));
    setPhotoFile(null);
  };

  const handleSave = async () => {
    if (!opnameId) {
      alert('Geen opname ID gevonden');
      return;
    }

    if (!buildingData.buildingName || !buildingData.address) {
      alert('Vul minimaal de gebouwnaam en adres in');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update opname in database
      await updateOpname(opnameId, {
        gebouwnaam: buildingData.buildingName,
        adres: buildingData.address,
        postcode: buildingData.postcode,
        huisnummer: buildingData.houseNumber,
        huisnummertoevoeging: buildingData.houseAddition,
        straat: buildingData.street,
        stad: buildingData.city,
        gebouwtype: buildingData.buildingType || undefined,
        energielabel: buildingData.energyLabel || undefined,
        gebouwOppervlakte: buildingData.buildingArea,
        datumOpname: buildingData.date,
        contactpersoon: buildingData.contactPerson || undefined,
      });

      // Upload foto als die er is
      if (photoFile) {
        try {
          // Verwijder oude foto eerst (als die bestaat)
          if (existingFotoId) {
            try {
              await deleteOpnameFoto(opnameId, existingFotoId);
              setExistingFotoId(null);
            } catch (error) {
              console.error('Fout bij verwijderen oude foto:', error);
              // Ga door met uploaden nieuwe foto
            }
          }
          
          // Upload nieuwe foto
          const newFotoId = await uploadOpnameFoto(opnameId, photoFile, 'gebouw', 'Gebouwfoto');
          setExistingFotoId(newFotoId);
        } catch (error) {
          console.error('Fout bij uploaden foto:', error);
        }
      }

      // Backward compatibility: sla ook op in localStorage
      localStorage.setItem('gacsBuildingData', JSON.stringify(buildingData));
    } catch (error) {
      console.error('Fout bij opslaan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Fout bij opslaan';
      alert(`Fout bij opslaan: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    setIsNavigating(true);
    try {
      await handleSave();
      router.push(`/opnamen/${opnameId}/verwarmingssysteem`);
    } catch (error) {
      console.error('Fout bij navigeren:', error);
      setIsNavigating(false);
    }
  };

  if (isLoading || isNavigating) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c7d316] mx-auto mb-4"></div>
          <p className="text-[#343234]">{isNavigating ? 'Navigeren...' : 'Laden...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <Header onSave={handleSave} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <TimelineNavigation onSave={handleSave} />
          
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
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
            
            <div className="p-8 space-y-6">
              {/* Adres zoeken */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoek adres
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Voer adres, postcode of plaats in"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoadingAddress}
                    className="px-4 py-2 bg-[#c7d316] text-[#343234] rounded-md hover:bg-[#b3c014] transition-colors duration-200 font-bold disabled:opacity-50"
                  >
                    {isLoadingAddress ? 'Zoeken...' : 'Zoeken'}
                  </button>
                </div>
                
                {showAddressTable && addressResults.length > 0 && (
                  <div className="mt-4 mb-6">
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
                                {address.huisnummer}{address.huisletter || ''}{address.huisnummertoevoeging ? '-' + address.huisnummertoevoeging : ''}
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
              </div>

              {/* Gebouwnaam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gebouwnaam *
                </label>
                <input
                  type="text"
                  name="buildingName"
                  value={buildingData.buildingName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
                  required
                />
              </div>

              {/* Adres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres *
                </label>
                <input
                  type="text"
                  name="address"
                  value={buildingData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
                  required
                />
              </div>

              {/* Postcode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={buildingData.postcode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
                />
              </div>

              {/* Huisnummer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Huisnummer
                </label>
                <input
                  type="text"
                  name="houseNumber"
                  value={buildingData.houseNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
                />
              </div>

              {/* Gebouwtype */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gebouwtype
                </label>
                <select
                  name="buildingType"
                  value={buildingData.buildingType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
                >
                  <option value="">Selecteer gebouwtype</option>
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

              {/* Energielabel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energielabel
                </label>
                <select
                  name="energyLabel"
                  value={buildingData.energyLabel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
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

              {/* Gebouw oppervlakte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gebouw oppervlakte (m²)
                </label>
                <input
                  type="number"
                  name="buildingArea"
                  value={buildingData.buildingArea || ''}
                  onChange={(e) => setBuildingData(prev => ({ ...prev, buildingArea: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
                />
              </div>

              {/* Datum opname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum opname *
                </label>
                <input
                  type="date"
                  name="date"
                  value={buildingData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
                  required
                />
              </div>

              {/* Contactpersoon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contactpersoon
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={buildingData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
                />
              </div>

              {/* Foto upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gebouwfoto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316]"
                />
                {buildingData.photo && (
                  <div className="mt-4 relative">
                    <img 
                      src={buildingData.photo} 
                      alt="Gebouw" 
                      className="max-w-md h-64 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  onClick={handleNext}
                  disabled={isSaving}
                  className="bg-[#c7d316] text-[#343234] px-6 py-3 rounded-md hover:bg-[#b3c014] transition-colors duration-200 font-bold disabled:opacity-50"
                >
                  {isSaving ? 'Opslaan...' : 'Volgende'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

