'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TimelineNavigationAdvanced from '@/components/TimelineNavigationAdvanced';
import HeaderAdvanced from '@/components/HeaderAdvanced';

interface SavedOpwekker {
  id: string;
  name: string;
  heating: {
    heatPumpLW: { enabled: boolean; power: string };
    heatPumpLL: { enabled: boolean; power: string };
    districtHeating: { enabled: boolean; power: string };
    fuelHeater: { enabled: boolean; power: string };
    undergroundStorageGJ: { enabled: boolean; capacity: string };
    otherStorageGJ: { enabled: boolean; capacity: string };
  };
  cooling: {
    coldWaterMachine: { enabled: boolean; power: string };
    undergroundStorageGJ: { enabled: boolean; capacity: string };
    otherStorageGJ: { enabled: boolean; capacity: string };
  };
  ventilation: {
    airHandlingCombi: { enabled: boolean; flow: string };
    supplyAir: { enabled: boolean; flow: string };
    exhaustAir: { enabled: boolean; flow: string };
    hybridVentilation: { enabled: boolean; flow: string };
    naturalVentilation: { enabled: boolean };
  };
  electrical: {
    pvPanels: { enabled: boolean; power: string };
    electricalBattery: { enabled: boolean; capacity: string };
  };
}

export default function OpwekkingPage() {
  const router = useRouter();
  const [opwekkerName, setOpwekkerName] = useState('');
  const [savedOpwekkers, setSavedOpwekkers] = useState<SavedOpwekker[]>([]);

  // Heating state
  const [heating, setHeating] = useState({
    heatPumpLW: { enabled: false, power: '' },
    heatPumpLL: { enabled: false, power: '' },
    districtHeating: { enabled: false, power: '' },
    fuelHeater: { enabled: false, power: '' },
    undergroundStorageGJ: { enabled: false, capacity: '' },
    otherStorageGJ: { enabled: false, capacity: '' },
  });

  // Cooling state
  const [cooling, setCooling] = useState({
    coldWaterMachine: { enabled: false, power: '' },
    undergroundStorageGJ: { enabled: false, capacity: '' },
    otherStorageGJ: { enabled: false, capacity: '' },
  });

  // Ventilation state
  const [ventilation, setVentilation] = useState({
    airHandlingCombi: { enabled: false, flow: '' },
    supplyAir: { enabled: false, flow: '' },
    exhaustAir: { enabled: false, flow: '' },
    hybridVentilation: { enabled: false, flow: '' },
    naturalVentilation: { enabled: false },
  });

  // Electrical state
  const [electrical, setElectrical] = useState({
    pvPanels: { enabled: false, power: '' },
    electricalBattery: { enabled: false, capacity: '' },
  });

  const handleHeatingToggle = (key: keyof typeof heating) => {
    setHeating(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled
      }
    }));
  };

  const handleCoolingToggle = (key: keyof typeof cooling) => {
    setCooling(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled
      }
    }));
  };

  const handleHeatingPowerChange = (key: keyof typeof heating, value: string) => {
    setHeating(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        power: key.includes('Storage') ? (prev[key] as { power?: string }).power || '' : value,
        capacity: key.includes('Storage') ? value : (prev[key] as { capacity?: string }).capacity || ''
      }
    }));
  };

  const handleCoolingPowerChange = (key: keyof typeof cooling, value: string) => {
    setCooling(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        power: key.includes('Storage') ? (prev[key] as { power?: string }).power || '' : value,
        capacity: key.includes('Storage') ? value : (prev[key] as { capacity?: string }).capacity || ''
      }
    }));
  };

  const handleVentilationToggle = (key: keyof typeof ventilation) => {
    setVentilation(prev => ({
      ...prev,
      [key]: key === 'naturalVentilation' 
        ? { enabled: !prev[key].enabled }
        : {
            ...prev[key],
            enabled: !(prev[key] as { enabled: boolean }).enabled
          }
    }));
  };

  const handleVentilationFlowChange = (key: keyof typeof ventilation, value: string) => {
    if (key !== 'naturalVentilation') {
      setVentilation(prev => ({
        ...prev,
        [key]: {
          ...(prev[key] as { enabled: boolean; flow: string }),
          flow: value
        }
      }));
    }
  };

  const handleElectricalToggle = (key: keyof typeof electrical) => {
    setElectrical(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled
      }
    }));
  };

  const handleElectricalValueChange = (key: keyof typeof electrical, value: string) => {
    setElectrical(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        power: key === 'pvPanels' ? value : (prev[key] as { power?: string }).power || '',
        capacity: key === 'electricalBattery' ? value : (prev[key] as { capacity?: string }).capacity || ''
      }
    }));
  };

  const handleSave = () => {
    if (!opwekkerName.trim()) {
      alert('Geef de opwekker een naam');
      return;
    }

    const newOpwekker: SavedOpwekker = {
      id: Date.now().toString(),
      name: opwekkerName,
      heating: { ...heating },
      cooling: { ...cooling },
      ventilation: { ...ventilation },
      electrical: { ...electrical }
    };

    setSavedOpwekkers([...savedOpwekkers, newOpwekker]);
    
    // Reset form
    setOpwekkerName('');
    setHeating({
      heatPumpLW: { enabled: false, power: '' },
      heatPumpLL: { enabled: false, power: '' },
      districtHeating: { enabled: false, power: '' },
      fuelHeater: { enabled: false, power: '' },
      undergroundStorageGJ: { enabled: false, capacity: '' },
      otherStorageGJ: { enabled: false, capacity: '' },
    });
    setCooling({
      coldWaterMachine: { enabled: false, power: '' },
      undergroundStorageGJ: { enabled: false, capacity: '' },
      otherStorageGJ: { enabled: false, capacity: '' },
    });
    setVentilation({
      airHandlingCombi: { enabled: false, flow: '' },
      supplyAir: { enabled: false, flow: '' },
      exhaustAir: { enabled: false, flow: '' },
      hybridVentilation: { enabled: false, flow: '' },
      naturalVentilation: { enabled: false },
    });
    setElectrical({
      pvPanels: { enabled: false, power: '' },
      electricalBattery: { enabled: false, capacity: '' },
    });
  };

  const handleDelete = (id: string) => {
    setSavedOpwekkers(savedOpwekkers.filter(opwekker => opwekker.id !== id));
  };

  const handleNext = () => {
    router.push('/opnamen-geavanceerd/distributie');
  };

  const handlePrevious = () => {
    router.push('/opnamen-geavanceerd/ruimtetypes');
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
                  <span className="text-[#343234] font-bold text-lg">3</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Opwekking
                </h1>
              </div>
              <div className="bg-[#c7d316]/10 text-[#343234] px-3 py-1 rounded-full text-sm font-medium">
                Gebouwgegevens
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              {/* Opwekker Name Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naam opwekker
                </label>
                <input
                  type="text"
                  value={opwekkerName}
                  onChange={(e) => setOpwekkerName(e.target.value)}
                  placeholder="Geef een naam voor deze opwekker"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] bg-white text-gray-900"
                />
              </div>

              {/* Section Title */}
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Kies het type warmte/koude opwekker dat je wilt toevoegen
              </h2>
              <p className="text-sm text-gray-600 mb-6 italic">
                Selecteer minimaal 1 opwekker of deze koeling en/of verwarming levert.<br />
                Geef ook het vermogen of de capaciteit op.
              </p>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* VERWARMEN Section */}
                <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
                  <h3 className="text-center font-bold text-gray-800 mb-6 text-lg">VERWARMEN</h3>
                  
                  <div className="space-y-4">
                    {/* Warmtepomp (L/W en W/W) */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => handleHeatingToggle('heatPumpLW')}
                        className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                          heating.heatPumpLW.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          heating.heatPumpLW.enabled ? 'translate-x-9' : 'translate-x-1'
                        }`} />
                      </button>
                      <input
                        type="number"
                        value={heating.heatPumpLW.power}
                        onChange={(e) => handleHeatingPowerChange('heatPumpLW', e.target.value)}
                        disabled={!heating.heatPumpLW.enabled}
                        placeholder=".. kW"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 w-48">Warmtepomp (L/W en W/W)</span>
                    </div>

                    {/* Warmtepomp / Airco (L/L) */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => handleHeatingToggle('heatPumpLL')}
                        className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                          heating.heatPumpLL.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          heating.heatPumpLL.enabled ? 'translate-x-9' : 'translate-x-1'
                        }`} />
                      </button>
                      <input
                        type="number"
                        value={heating.heatPumpLL.power}
                        onChange={(e) => handleHeatingPowerChange('heatPumpLL', e.target.value)}
                        disabled={!heating.heatPumpLL.enabled}
                        placeholder=".. kW"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 w-48">Warmtepomp / Airco (L/L)</span>
                    </div>

                    {/* Stads-verwarming / -koeling */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => handleHeatingToggle('districtHeating')}
                        className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                          heating.districtHeating.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          heating.districtHeating.enabled ? 'translate-x-9' : 'translate-x-1'
                        }`} />
                      </button>
                      <input
                        type="number"
                        value={heating.districtHeating.power}
                        onChange={(e) => handleHeatingPowerChange('districtHeating', e.target.value)}
                        disabled={!heating.districtHeating.enabled}
                        placeholder=".. kW"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 w-48">Stads-verwarming / -koeling</span>
                    </div>

                    {/* Brandstof opwekker */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => handleHeatingToggle('fuelHeater')}
                        className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                          heating.fuelHeater.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          heating.fuelHeater.enabled ? 'translate-x-9' : 'translate-x-1'
                        }`} />
                      </button>
                      <input
                        type="number"
                        value={heating.fuelHeater.power}
                        onChange={(e) => handleHeatingPowerChange('fuelHeater', e.target.value)}
                        disabled={!heating.fuelHeater.enabled}
                        placeholder=".. kW"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 w-48">Brandstof opwekker</span>
                    </div>

                    {/* WKO (ondergrondse opslag) */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => handleHeatingToggle('undergroundStorageGJ')}
                        className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                          heating.undergroundStorageGJ.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          heating.undergroundStorageGJ.enabled ? 'translate-x-9' : 'translate-x-1'
                        }`} />
                      </button>
                      <input
                        type="number"
                        value={heating.undergroundStorageGJ.capacity}
                        onChange={(e) => handleHeatingPowerChange('undergroundStorageGJ', e.target.value)}
                        disabled={!heating.undergroundStorageGJ.enabled}
                        placeholder=".. GJ"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 w-48">WKO (ondergrondse opslag)</span>
                    </div>

                    {/* Overige thermische opslag */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => handleHeatingToggle('otherStorageGJ')}
                        className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                          heating.otherStorageGJ.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          heating.otherStorageGJ.enabled ? 'translate-x-9' : 'translate-x-1'
                        }`} />
                      </button>
                      <input
                        type="number"
                        value={heating.otherStorageGJ.capacity}
                        onChange={(e) => handleHeatingPowerChange('otherStorageGJ', e.target.value)}
                        disabled={!heating.otherStorageGJ.enabled}
                        placeholder=".. GJ"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 w-48">Overige thermische opslag</span>
                    </div>
                  </div>
                </div>

                {/* KOELEN Section */}
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                  <h3 className="text-center font-bold text-gray-800 mb-6 text-lg">KOELEN</h3>
                  
                  <div className="space-y-4">
                    {/* Koudwater-machine */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => handleCoolingToggle('coldWaterMachine')}
                        className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                          cooling.coldWaterMachine.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          cooling.coldWaterMachine.enabled ? 'translate-x-9' : 'translate-x-1'
                        }`} />
                      </button>
                      <input
                        type="number"
                        value={cooling.coldWaterMachine.power}
                        onChange={(e) => handleCoolingPowerChange('coldWaterMachine', e.target.value)}
                        disabled={!cooling.coldWaterMachine.enabled}
                        placeholder=".. kW"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 w-48">Koudwater-machine</span>
                    </div>

                    {/* WKO (ondergrondse opslag) */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => handleCoolingToggle('undergroundStorageGJ')}
                        className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                          cooling.undergroundStorageGJ.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          cooling.undergroundStorageGJ.enabled ? 'translate-x-9' : 'translate-x-1'
                        }`} />
                      </button>
                      <input
                        type="number"
                        value={cooling.undergroundStorageGJ.capacity}
                        onChange={(e) => handleCoolingPowerChange('undergroundStorageGJ', e.target.value)}
                        disabled={!cooling.undergroundStorageGJ.enabled}
                        placeholder=".. GJ"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 w-48">WKO (ondergrondse opslag)</span>
                    </div>

                    {/* Overige thermische opslag */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => handleCoolingToggle('otherStorageGJ')}
                        className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                          cooling.otherStorageGJ.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          cooling.otherStorageGJ.enabled ? 'translate-x-9' : 'translate-x-1'
                        }`} />
                      </button>
                      <input
                        type="number"
                        value={cooling.otherStorageGJ.capacity}
                        onChange={(e) => handleCoolingPowerChange('otherStorageGJ', e.target.value)}
                        disabled={!cooling.otherStorageGJ.enabled}
                        placeholder=".. GJ"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-sm text-gray-700 w-48">Overige thermische opslag</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ventilatie en Elektra Section */}
              <div className="mt-12">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Kies het type ventilatie en elektra
                </h2>
                <p className="text-sm text-gray-600 mb-6 italic">
                  Selecteer minimaal 1 ventilatie optie
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* VENTILATIE Section */}
                  <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                    <h3 className="text-center font-bold text-gray-800 mb-6 text-lg">VENTILATIE</h3>
                    
                    <div className="space-y-4">
                      {/* Luchtbehandeling (combi TV/AV) */}
                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => handleVentilationToggle('airHandlingCombi')}
                          className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                            ventilation.airHandlingCombi.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                            ventilation.airHandlingCombi.enabled ? 'translate-x-9' : 'translate-x-1'
                          }`} />
                        </button>
                        <input
                          type="number"
                          value={ventilation.airHandlingCombi.flow}
                          onChange={(e) => handleVentilationFlowChange('airHandlingCombi', e.target.value)}
                          disabled={!ventilation.airHandlingCombi.enabled}
                          placeholder=".. m3/h"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <span className="text-sm text-gray-700 w-48">Luchtbehandeling (combi TV/AV)</span>
                      </div>

                      {/* Lucht-toevoerkast (apart) */}
                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => handleVentilationToggle('supplyAir')}
                          className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                            ventilation.supplyAir.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                            ventilation.supplyAir.enabled ? 'translate-x-9' : 'translate-x-1'
                          }`} />
                        </button>
                        <input
                          type="number"
                          value={ventilation.supplyAir.flow}
                          onChange={(e) => handleVentilationFlowChange('supplyAir', e.target.value)}
                          disabled={!ventilation.supplyAir.enabled}
                          placeholder=".. m3/h"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <span className="text-sm text-gray-700 w-48">Lucht-toevoerkast (apart)</span>
                      </div>

                      {/* Lucht-afvoerkast (apart) */}
                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => handleVentilationToggle('exhaustAir')}
                          className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                            ventilation.exhaustAir.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                            ventilation.exhaustAir.enabled ? 'translate-x-9' : 'translate-x-1'
                          }`} />
                        </button>
                        <input
                          type="number"
                          value={ventilation.exhaustAir.flow}
                          onChange={(e) => handleVentilationFlowChange('exhaustAir', e.target.value)}
                          disabled={!ventilation.exhaustAir.enabled}
                          placeholder=".. m3/h"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <span className="text-sm text-gray-700 w-48">Lucht-afvoerkast (apart)</span>
                      </div>

                      {/* Afzuiging (hybride ventilatie) */}
                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => handleVentilationToggle('hybridVentilation')}
                          className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                            ventilation.hybridVentilation.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                            ventilation.hybridVentilation.enabled ? 'translate-x-9' : 'translate-x-1'
                          }`} />
                        </button>
                        <input
                          type="number"
                          value={ventilation.hybridVentilation.flow}
                          onChange={(e) => handleVentilationFlowChange('hybridVentilation', e.target.value)}
                          disabled={!ventilation.hybridVentilation.enabled}
                          placeholder=".. m3/h"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <span className="text-sm text-gray-700 w-48">Afzuiging (hybride ventilatie)</span>
                      </div>

                      {/* Natuurlijke ventilatie */}
                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => handleVentilationToggle('naturalVentilation')}
                          className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                            ventilation.naturalVentilation.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                            ventilation.naturalVentilation.enabled ? 'translate-x-9' : 'translate-x-1'
                          }`} />
                        </button>
                        <div className="flex-1"></div>
                        <span className="text-sm text-gray-700 w-48">Natuurlijke ventilatie</span>
                      </div>
                    </div>
                  </div>

                  {/* ELEKTRA Section */}
                  <div className="border-2 border-yellow-200 rounded-lg p-6 bg-yellow-50">
                    <h3 className="text-center font-bold text-gray-800 mb-6 text-lg">ELEKTRA</h3>
                    
                    <div className="space-y-4">
                      {/* PV-panelen */}
                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => handleElectricalToggle('pvPanels')}
                          className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                            electrical.pvPanels.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                            electrical.pvPanels.enabled ? 'translate-x-9' : 'translate-x-1'
                          }`} />
                        </button>
                        <input
                          type="number"
                          value={electrical.pvPanels.power}
                          onChange={(e) => handleElectricalValueChange('pvPanels', e.target.value)}
                          disabled={!electrical.pvPanels.enabled}
                          placeholder=".. kW"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <span className="text-sm text-gray-700 w-48">PV-panelen</span>
                      </div>

                      {/* Elektrische Accu's */}
                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => handleElectricalToggle('electricalBattery')}
                          className={`w-16 h-8 rounded-full transition-colors duration-200 ${
                            electrical.electricalBattery.enabled ? 'bg-[#c7d316]' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                            electrical.electricalBattery.enabled ? 'translate-x-9' : 'translate-x-1'
                          }`} />
                        </button>
                        <input
                          type="number"
                          value={electrical.electricalBattery.capacity}
                          onChange={(e) => handleElectricalValueChange('electricalBattery', e.target.value)}
                          disabled={!electrical.electricalBattery.enabled}
                          placeholder=".. kWh"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <span className="text-sm text-gray-700 w-48">Elektrische Accu&apos;s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-[#c7d316] text-[#343234] rounded-lg hover:bg-[#b3c014] transition-colors duration-200 font-bold"
                >
                  Opslaan
                </button>
              </div>

              {/* Saved Opwekkers Section */}
              <div className="mt-12 border-t-2 border-gray-200 pt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Opgeslagen ruimtetypes</h3>
                
                {savedOpwekkers.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">Voeg uw eerste ruimte type toe</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                      <thead className="bg-[#c7d316]/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                            Naam opwekker
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                            Verwarmen
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                            Koelen
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                            Totaal Vermogen (kW)
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                            Opslag (GJ)
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                            Ventilatie
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                            Elektra
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                            Acties
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {savedOpwekkers.map((opwekker) => {
                          const heatingCount = Object.values(opwekker.heating).filter(v => v.enabled).length;
                          const coolingCount = Object.values(opwekker.cooling).filter(v => v.enabled).length;
                          const ventilationCount = Object.values(opwekker.ventilation).filter(v => v.enabled).length;
                          const electricalCount = Object.values(opwekker.electrical).filter(v => v.enabled).length;
                          
                          // Calculate total power (kW)
                          const heatingPower = [
                            parseFloat(opwekker.heating.heatPumpLW.power) || 0,
                            parseFloat(opwekker.heating.heatPumpLL.power) || 0,
                            parseFloat(opwekker.heating.districtHeating.power) || 0,
                            parseFloat(opwekker.heating.fuelHeater.power) || 0,
                          ].reduce((sum, val) => sum + val, 0);
                          
                          const coolingPower = parseFloat(opwekker.cooling.coldWaterMachine.power) || 0;
                          const totalPower = heatingPower + coolingPower;
                          
                          // Calculate total storage (GJ)
                          const heatingStorage = [
                            parseFloat(opwekker.heating.undergroundStorageGJ.capacity) || 0,
                            parseFloat(opwekker.heating.otherStorageGJ.capacity) || 0,
                          ].reduce((sum, val) => sum + val, 0);
                          
                          const coolingStorage = [
                            parseFloat(opwekker.cooling.undergroundStorageGJ.capacity) || 0,
                            parseFloat(opwekker.cooling.otherStorageGJ.capacity) || 0,
                          ].reduce((sum, val) => sum + val, 0);
                          
                          const totalStorage = heatingStorage + coolingStorage;
                          
                          return (
                            <tr key={opwekker.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                {opwekker.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {heatingCount} type(s)
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {coolingCount} type(s)
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                {totalPower > 0 ? `${totalPower.toFixed(1)} kW` : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                {totalStorage > 0 ? `${totalStorage.toFixed(1)} GJ` : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {ventilationCount} type(s)
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {electricalCount} type(s)
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleDelete(opwekker.id)}
                                  className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Verwijderen
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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
