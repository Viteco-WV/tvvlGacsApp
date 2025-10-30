'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TimelineNavigationAdvanced from '@/components/TimelineNavigationAdvanced';
import HeaderAdvanced from '@/components/HeaderAdvanced';

interface RoomTypeComponents {
  heating: {
    none: boolean;
    radiatorsConvectors: boolean;
    ventilatorConvectorFCU: boolean;
    floorCeiling: boolean;
    floorWallSystem: boolean;
    fullAirAllAir: boolean;
    inductionUnit: boolean;
    concreteActivation: boolean;
  };
  cooling: {
    none: boolean;
    ventilatorConvectorFCU: boolean;
    floorCeiling: boolean;
    floorWallSystem: boolean;
    fullAirAllAir: boolean;
    inductionUnit: boolean;
    concreteActivation: boolean;
  };
  controls: {
    ceiling: {
      handCrane: boolean;
      thermostaticKnob: boolean;
      electronicRotaryKnob: boolean;
      motorCovered: boolean;
    };
    wall: {
      sensorOnly: boolean;
      knobSwitchNoDisplay: boolean;
      operatingUnitSimple: boolean;
      operatingUnitExtended: boolean;
    };
    ceilingOrAbove: {
      knobCoveredMotor: boolean;
      movementSensorSingle: boolean;
      movementSensorEnkel: boolean;
      lightIntensityArmature: boolean;
      multiSensor: boolean;
    };
    room: {
      outdoorBlindHand: boolean;
      outdoorBlindDisplay: boolean;
      roomContact: boolean;
    };
  };
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview: string;
  data: string;
}

interface SavedRoomType {
  id: string;
  name: string;
  count: number;
  components: RoomTypeComponents;
  files: UploadedFile[];
  timestamp: string;
}

export default function RuimtetypesPage() {
  const router = useRouter();
  const [roomTypeName, setRoomTypeName] = useState('');
  const [roomTypeCount, setRoomTypeCount] = useState<number>(1);
  const [savedRoomTypes, setSavedRoomTypes] = useState<SavedRoomType[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [components, setComponents] = useState<RoomTypeComponents>({
    heating: {
      none: false,
      radiatorsConvectors: false,
      ventilatorConvectorFCU: false,
      floorCeiling: false,
      floorWallSystem: false,
      fullAirAllAir: false,
      inductionUnit: false,
      concreteActivation: false,
    },
    cooling: {
      none: false,
      ventilatorConvectorFCU: false,
      floorCeiling: false,
      floorWallSystem: false,
      fullAirAllAir: false,
      inductionUnit: false,
      concreteActivation: false,
    },
    controls: {
      ceiling: {
        handCrane: false,
        thermostaticKnob: false,
        electronicRotaryKnob: false,
        motorCovered: false,
      },
      wall: {
        sensorOnly: false,
        knobSwitchNoDisplay: false,
        operatingUnitSimple: false,
        operatingUnitExtended: false,
      },
      ceilingOrAbove: {
        knobCoveredMotor: false,
        movementSensorSingle: false,
        movementSensorEnkel: false,
        lightIntensityArmature: false,
        multiSensor: false,
      },
      room: {
        outdoorBlindHand: false,
        outdoorBlindDisplay: false,
        roomContact: false,
      },
    },
  });

  const handleToggle = (category: 'heating' | 'cooling', key: string) => {
    setComponents(prev => {
      const categoryData = prev[category];
      return {
        ...prev,
        [category]: {
          ...categoryData,
          [key]: !(categoryData as Record<string, boolean>)[key],
        },
      };
    });
  };

  const handleControlToggle = (section: keyof RoomTypeComponents['controls'], key: string) => {
    setComponents(prev => {
      const sectionData = prev.controls[section];
      return {
        ...prev,
        controls: {
          ...prev.controls,
          [section]: {
            ...sectionData,
            [key]: !(sectionData as Record<string, boolean>)[key],
          },
        },
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Check if adding these files would exceed the limit
    if (uploadedFiles.length + files.length > 8) {
      alert('Je kunt maximaal 8 bestanden uploaden');
      return;
    }

    Array.from(files).forEach(file => {
      // Validate file type
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Alleen PDF, PNG en JPG bestanden zijn toegestaan`);
        return;
      }

      // Validate file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name}: Bestand is te groot. Maximum grootte is 2MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          preview: event.target?.result as string,
          data: event.target?.result as string,
        };
        setUploadedFiles(prev => [...prev, fileData]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSave = () => {
    if (!roomTypeName.trim()) {
      alert('Vul een naam in voor het ruimtetype');
      return;
    }

    if (!roomTypeCount || roomTypeCount < 1) {
      alert('Vul een geldig aantal in (minimaal 1)');
      return;
    }

    const newRoomType: SavedRoomType = {
      id: Date.now().toString(),
      name: roomTypeName,
      count: roomTypeCount,
      components: { ...components },
      files: [...uploadedFiles],
      timestamp: new Date().toLocaleString('nl-NL'),
    };

    setSavedRoomTypes(prev => [...prev, newRoomType]);
    
    // Reset form
    setRoomTypeName('');
    setRoomTypeCount(1);
    setUploadedFiles([]);
    setComponents({
      heating: {
        none: false,
        radiatorsConvectors: false,
        ventilatorConvectorFCU: false,
        floorCeiling: false,
        floorWallSystem: false,
        fullAirAllAir: false,
        inductionUnit: false,
        concreteActivation: false,
      },
      cooling: {
        none: false,
        ventilatorConvectorFCU: false,
        floorCeiling: false,
        floorWallSystem: false,
        fullAirAllAir: false,
        inductionUnit: false,
        concreteActivation: false,
      },
      controls: {
        ceiling: {
          handCrane: false,
          thermostaticKnob: false,
          electronicRotaryKnob: false,
          motorCovered: false,
        },
        wall: {
          sensorOnly: false,
          knobSwitchNoDisplay: false,
          operatingUnitSimple: false,
          operatingUnitExtended: false,
        },
        ceilingOrAbove: {
          knobCoveredMotor: false,
          movementSensorSingle: false,
          movementSensorEnkel: false,
          lightIntensityArmature: false,
          multiSensor: false,
        },
        room: {
          outdoorBlindHand: false,
          outdoorBlindDisplay: false,
          roomContact: false,
        },
      },
    });
  };

  const handleDelete = (id: string) => {
    setSavedRoomTypes(prev => prev.filter(room => room.id !== id));
  };

  const getSelectedComponents = (components: RoomTypeComponents, category: 'heating' | 'cooling'): string[] => {
    const componentLabels: Record<string, string> = {
      none: 'Geen',
      radiatorsConvectors: 'Radiatoren/Convectoren',
      ventilatorConvectorFCU: 'FCU',
      floorCeiling: 'Klimaatplafond',
      floorWallSystem: 'Vloer/Wand',
      fullAirAllAir: 'Volledig lucht (all-air)',
      inductionUnit: 'Inductie-unit',
      concreteActivation: 'Beton Kern',
    };

    return Object.entries(components[category])
      .filter(([, value]) => value)
      .map(([key]) => componentLabels[key] || key);
  };

  const getSelectedControls = (controls: RoomTypeComponents['controls']): string => {
    const controlLabels = {
      ceiling: {
        label: 'Bij afgiftelichaam',
        items: {
          handCrane: 'Handkraan',
          thermostaticKnob: 'Thermostatische knop',
          electronicRotaryKnob: 'Elektronische draailoze knop',
          motorCovered: 'Stelmotor',
        }
      },
      wall: {
        label: 'Aan de wand',
        items: {
          sensorOnly: 'Alleen sensor',
          knobSwitchNoDisplay: 'Knop/Schakelaar',
          operatingUnitSimple: 'Bedienunit (eenvoudig)',
          operatingUnitExtended: 'Bedienunit (uitgebreid)',
        }
      },
      ceilingOrAbove: {
        label: 'Plafond (in of boven)',
        items: {
          knobCoveredMotor: 'Naregeling',
          movementSensorSingle: 'Stelmotor(en)',
          movementSensorEnkel: 'Bewegingsmelder',
          lightIntensityArmature: 'Lichtintensiteit',
          multiSensor: 'Multi-sensor',
        }
      },
      room: {
        label: 'Bij het raam',
        items: {
          outdoorBlindHand: 'Zonwering (hand)',
          outdoorBlindDisplay: 'Zonwering (display)',
          roomContact: 'Raamcontact',
        }
      }
    };

    const sections: string[] = [];

    (Object.keys(controlLabels) as Array<keyof typeof controlLabels>).forEach((sectionKey) => {
      const section = controlLabels[sectionKey];
      const selectedItems = Object.entries(controls[sectionKey])
        .filter(([, value]) => value)
        .map(([key]) => section.items[key as keyof typeof section.items]);

      if (selectedItems.length > 0) {
        sections.push(`${section.label} - ${selectedItems.join(', ')}`);
      }
    });

    return sections.join('; ') || '-';
  };

  const handleNext = () => {
    router.push('/opnamen-geavanceerd/opwekking');
  };

  const handlePrevious = () => {
    router.push('/opnamen-geavanceerd/algemeen');
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
                  <span className="text-[#343234] font-bold text-lg">2</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Ruimtetypes
                </h1>
              </div>
              <div className="bg-[#c7d316]/10 text-[#343234] px-3 py-1 rounded-full text-sm font-medium">
                Gebouwgegevens
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
          
          {/* Room Type Name Input */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naam ruimtetype
                </label>
                <input
                  type="text"
                  value={roomTypeName}
                  onChange={(e) => setRoomTypeName(e.target.value)}
                  placeholder="Geef een naam voor deze ruimte template"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hoe vaak komt dit ruimte type voor?
                </label>
                <input
                  type="number"
                  min="1"
                  value={roomTypeCount}
                  onChange={(e) => setRoomTypeCount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Component Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#343234] mb-2">
              Kies de afgifte componenten
            </h2>
            <p className="text-sm text-gray-600 italic mb-6">
              Meerdere keuzes zijn mogelijk, maar niet alles wordt geaccepteerd.
            </p>

            <div className="grid grid-cols-2 gap-8">
              {/* Verwarmen Column */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-center font-bold text-red-600 mb-4 text-lg">VERWARMEN</h3>
                <div className="space-y-3">
                  <ToggleSwitch
                    label="Geen"
                    checked={components.heating.none}
                    onChange={() => handleToggle('heating', 'none')}
                  />
                  <ToggleSwitch
                    label="Radiatoren / Convectoren"
                    checked={components.heating.radiatorsConvectors}
                    onChange={() => handleToggle('heating', 'radiatorsConvectors')}
                  />
                  <ToggleSwitch
                    label="Ventilator-convector (FCU)"
                    checked={components.heating.ventilatorConvectorFCU}
                    onChange={() => handleToggle('heating', 'ventilatorConvectorFCU')}
                  />
                  <ToggleSwitch
                    label="Klimaatplafond"
                    checked={components.heating.floorCeiling}
                    onChange={() => handleToggle('heating', 'floorCeiling')}
                  />
                  <ToggleSwitch
                    label="Vloer- of Wandsysteem"
                    checked={components.heating.floorWallSystem}
                    onChange={() => handleToggle('heating', 'floorWallSystem')}
                  />
                  <ToggleSwitch
                    label="Volledig lucht (all-air)"
                    checked={components.heating.fullAirAllAir}
                    onChange={() => handleToggle('heating', 'fullAirAllAir')}
                  />
                  <ToggleSwitch
                    label="Inductie-unit"
                    checked={components.heating.inductionUnit}
                    onChange={() => handleToggle('heating', 'inductionUnit')}
                  />
                  <ToggleSwitch
                    label="Beton Kern Activering"
                    checked={components.heating.concreteActivation}
                    onChange={() => handleToggle('heating', 'concreteActivation')}
                  />
                </div>
              </div>

              {/* Koelen Column */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-center font-bold text-blue-600 mb-4 text-lg">KOELEN</h3>
                <div className="space-y-3">
                  <ToggleSwitch
                    label="Geen"
                    checked={components.cooling.none}
                    onChange={() => handleToggle('cooling', 'none')}
                  />
                  <ToggleSwitch
                    label="Ventilator-convector (FCU)"
                    checked={components.cooling.ventilatorConvectorFCU}
                    onChange={() => handleToggle('cooling', 'ventilatorConvectorFCU')}
                  />
                  <ToggleSwitch
                    label="Klimaatplafond"
                    checked={components.cooling.floorCeiling}
                    onChange={() => handleToggle('cooling', 'floorCeiling')}
                  />
                  <ToggleSwitch
                    label="Vloer- of Wandsysteem"
                    checked={components.cooling.floorWallSystem}
                    onChange={() => handleToggle('cooling', 'floorWallSystem')}
                  />
                  <ToggleSwitch
                    label="Volledig lucht (all-air)"
                    checked={components.cooling.fullAirAllAir}
                    onChange={() => handleToggle('cooling', 'fullAirAllAir')}
                  />
                  <ToggleSwitch
                    label="Inductie-unit"
                    checked={components.cooling.inductionUnit}
                    onChange={() => handleToggle('cooling', 'inductionUnit')}
                  />
                  <ToggleSwitch
                    label="Beton Kern Activering"
                    checked={components.cooling.concreteActivation}
                    onChange={() => handleToggle('cooling', 'concreteActivation')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Control Options Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#343234] mb-2">
              Kies de bedieningsmogelijkheden in de ruimte
            </h2>
            <p className="text-sm text-gray-600 italic mb-6">
              Meerdere keuzes zijn mogelijk, maar niet alles wordt geaccepteerd.
            </p>

            <div className="grid grid-cols-4 gap-6">
              {/* BIJ AFGIFTELICHAAM Column */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">BIJ AFGIFTELICHAAM</h3>
                <div className="space-y-3">
                  <ToggleSwitch
                    label="Handkraan"
                    checked={components.controls.ceiling.handCrane}
                    onChange={() => handleControlToggle('ceiling', 'handCrane')}
                  />
                  <ToggleSwitch
                    label="Thermostatische knop"
                    checked={components.controls.ceiling.thermostaticKnob}
                    onChange={() => handleControlToggle('ceiling', 'thermostaticKnob')}
                  />
                  <ToggleSwitch
                    label="Elektronische draailoze knop"
                    checked={components.controls.ceiling.electronicRotaryKnob}
                    onChange={() => handleControlToggle('ceiling', 'electronicRotaryKnob')}
                  />
                  <ToggleSwitch
                    label="Stelmotor (bekabeld)"
                    checked={components.controls.ceiling.motorCovered}
                    onChange={() => handleControlToggle('ceiling', 'motorCovered')}
                  />
                </div>
              </div>

              {/* AAN DE WAND Column */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">AAN DE WAND</h3>
                <div className="space-y-3">
                  <ToggleSwitch
                    label="Alleen sensor"
                    checked={components.controls.wall.sensorOnly}
                    onChange={() => handleControlToggle('wall', 'sensorOnly')}
                  />
                  <ToggleSwitch
                    label="Knop / Schakelaar (zonder display)"
                    checked={components.controls.wall.knobSwitchNoDisplay}
                    onChange={() => handleControlToggle('wall', 'knobSwitchNoDisplay')}
                  />
                  <ToggleSwitch
                    label="Bedienunit (eenvoudig)"
                    checked={components.controls.wall.operatingUnitSimple}
                    onChange={() => handleControlToggle('wall', 'operatingUnitSimple')}
                  />
                  <ToggleSwitch
                    label="Bedienunit (uitgebreid)"
                    checked={components.controls.wall.operatingUnitExtended}
                    onChange={() => handleControlToggle('wall', 'operatingUnitExtended')}
                  />
                </div>
              </div>

              {/* PLAFOND (IN of BOVEN) Column */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">PLAFOND (IN of BOVEN)</h3>
                <div className="space-y-3">
                  <ToggleSwitch
                    label="Naregeling"
                    checked={components.controls.ceilingOrAbove.knobCoveredMotor}
                    onChange={() => handleControlToggle('ceilingOrAbove', 'knobCoveredMotor')}
                  />
                  <ToggleSwitch
                    label="Stelmotor(en) (bekabeld)"
                    checked={components.controls.ceilingOrAbove.movementSensorSingle}
                    onChange={() => handleControlToggle('ceilingOrAbove', 'movementSensorSingle')}
                  />
                  <ToggleSwitch
                    label="Bewegingsmelder (enkel)"
                    checked={components.controls.ceilingOrAbove.movementSensorEnkel}
                    onChange={() => handleControlToggle('ceilingOrAbove', 'movementSensorEnkel')}
                  />
                  <ToggleSwitch
                    label="Lichtintensiteit (evt. in armatuur)"
                    checked={components.controls.ceilingOrAbove.lightIntensityArmature}
                    onChange={() => handleControlToggle('ceilingOrAbove', 'lightIntensityArmature')}
                  />
                  <ToggleSwitch
                    label="Multi-sensor"
                    checked={components.controls.ceilingOrAbove.multiSensor}
                    onChange={() => handleControlToggle('ceilingOrAbove', 'multiSensor')}
                  />
                </div>
              </div>

              {/* BIJ HET RAAM Column */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">BIJ HET RAAM</h3>
                <div className="space-y-3">
                  <ToggleSwitch
                    label="Buiten zonwering (HAND)"
                    checked={components.controls.room.outdoorBlindHand}
                    onChange={() => handleControlToggle('room', 'outdoorBlindHand')}
                  />
                  <ToggleSwitch
                    label="Buiten zonwering (via display)"
                    checked={components.controls.room.outdoorBlindDisplay}
                    onChange={() => handleControlToggle('room', 'outdoorBlindDisplay')}
                  />
                  <ToggleSwitch
                    label="Raamcontact"
                    checked={components.controls.room.roomContact}
                    onChange={() => handleControlToggle('room', 'roomContact')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#343234] mb-2">
              Bestanden / Foto&apos;s uploaden
            </h2>
            <p className="text-sm text-gray-600 italic mb-4">
              Upload foto&apos;s of documenten van de ruimte. Maximaal 8 bestanden (PDF, PNG, JPG) van max 2MB per bestand.
            </p>

            <div className="bg-gray-50 rounded-lg p-6">
              {/* Upload Button */}
              <div className="mb-4">
                <label className="flex items-center justify-center w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#c7d316] hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm text-gray-600 font-medium">
                      Klik om bestanden te uploaden ({uploadedFiles.length}/8)
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadedFiles.length >= 8}
                  />
                </label>
              </div>

              {/* File Previews */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative bg-white rounded-lg p-2 border border-gray-200 shadow-sm group">
                      {/* Preview */}
                      <div className="aspect-square rounded overflow-hidden bg-gray-100 mb-2 flex items-center justify-center">
                        {file.type === 'application/pdf' ? (
                          <div className="flex flex-col items-center justify-center text-red-500">
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs mt-1">PDF</span>
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="text-xs text-gray-600 truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-[#c7d316] text-[#343234] rounded-md hover:bg-[#b3c014] transition-colors duration-200 font-medium"
            >
              Opslaan
            </button>
          </div>

          {/* Saved Room Types Table */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-[#343234] mb-4">
              Opgeslagen ruimtetypes
            </h2>
            
            {savedRoomTypes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Naam
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Aantal
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Verwarmen
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Koelen
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Bediening
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Bestanden
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Actie
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedRoomTypes.map((roomType) => {
                      const heatingComponents = getSelectedComponents(roomType.components, 'heating');
                      const coolingComponents = getSelectedComponents(roomType.components, 'cooling');
                      const controlsText = getSelectedControls(roomType.components.controls);
                      
                      return (
                        <tr key={roomType.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 font-medium">
                            {roomType.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 text-center font-medium">
                            {roomType.count}x
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                            {heatingComponents.length > 0 ? heatingComponents.join(', ') : '-'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                            {coolingComponents.length > 0 ? coolingComponents.join(', ') : '-'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                            {controlsText}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700">
                                {roomType.files.length}
                              </span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <button
                              onClick={() => handleDelete(roomType.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-xs font-medium"
                            >
                              Verwijderen
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-16 text-center">
                <p className="text-gray-400 text-lg">Voeg uw eerste ruimte type toe</p>
              </div>
            )}
          </div>
          
          {/* Navigation Buttons */}
          <div className="pt-6 flex flex-col gap-4 sm:flex-row justify-center border-t border-gray-200 mt-8">
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

// Toggle Switch Component
interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:ring-offset-2 ${
          checked ? 'bg-[#c7d316]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="ml-3 text-sm font-medium text-gray-700 flex-1">{label}</span>
    </div>
  );
}