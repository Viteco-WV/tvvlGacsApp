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
    fullAirAllAir: boolean;
    inductionUnit: boolean;
    concreteActivation: boolean;
  };
  cooling: {
    none: boolean;
    ventilatorConvectorFCU: boolean;
    floorCeiling: boolean;
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

interface SavedRoomType {
  id: string;
  name: string;
  count: number;
  components: RoomTypeComponents;
  timestamp: string;
}

export default function RuimtetypesPage() {
  const router = useRouter();
  const [roomTypeName, setRoomTypeName] = useState('');
  const [roomTypeCount, setRoomTypeCount] = useState<number>(1);
  const [savedRoomTypes, setSavedRoomTypes] = useState<SavedRoomType[]>([]);
  const [components, setComponents] = useState<RoomTypeComponents>({
    heating: {
      none: false,
      radiatorsConvectors: false,
      ventilatorConvectorFCU: true,
      floorCeiling: true,
      fullAirAllAir: false,
      inductionUnit: false,
      concreteActivation: false,
    },
    cooling: {
      none: false,
      ventilatorConvectorFCU: true,
      floorCeiling: true,
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
        operatingUnitExtended: true,
      },
      ceilingOrAbove: {
        knobCoveredMotor: false,
        movementSensorSingle: true,
        movementSensorEnkel: false,
        lightIntensityArmature: false,
        multiSensor: true,
      },
      room: {
        outdoorBlindHand: true,
        outdoorBlindDisplay: false,
        roomContact: false,
      },
    },
  });

  const handleToggle = (category: 'heating' | 'cooling', key: keyof RoomTypeComponents['heating'] | keyof RoomTypeComponents['cooling']) => {
    setComponents(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]],
      },
    }));
  };

  const handleControlToggle = (section: keyof RoomTypeComponents['controls'], key: string) => {
    setComponents(prev => ({
      ...prev,
      controls: {
        ...prev.controls,
        [section]: {
          ...prev.controls[section],
          [key]: !prev.controls[section][key as keyof typeof prev.controls[typeof section]],
        },
      },
    }));
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
      timestamp: new Date().toLocaleString('nl-NL'),
    };

    setSavedRoomTypes(prev => [...prev, newRoomType]);
    
    // Reset form
    setRoomTypeName('');
    setRoomTypeCount(1);
    setComponents({
      heating: {
        none: false,
        radiatorsConvectors: false,
        ventilatorConvectorFCU: false,
        floorCeiling: false,
        fullAirAllAir: false,
        inductionUnit: false,
        concreteActivation: false,
      },
      cooling: {
        none: false,
        ventilatorConvectorFCU: false,
        floorCeiling: false,
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
      fullAirAllAir: 'Vloer/Wand',
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white"
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
                    checked={components.heating.fullAirAllAir}
                    onChange={() => handleToggle('heating', 'fullAirAllAir')}
                  />
                  <ToggleSwitch
                    label="Volledig lucht (all-air)"
                    checked={components.heating.inductionUnit}
                    onChange={() => handleToggle('heating', 'inductionUnit')}
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
                    checked={components.cooling.fullAirAllAir}
                    onChange={() => handleToggle('cooling', 'fullAirAllAir')}
                  />
                  <ToggleSwitch
                    label="Volledig lucht (all-air)"
                    checked={components.cooling.inductionUnit}
                    onChange={() => handleToggle('cooling', 'inductionUnit')}
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
            
            {/* Save Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-[#c7d316] text-[#343234] rounded-md hover:bg-[#b3c014] transition-colors duration-200 font-medium"
              >
                Opslaan
              </button>
            </div>
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