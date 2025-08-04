'use client';

import { useRouter } from 'next/navigation';
import { Droplets, Snowflake, Wind, Lightbulb, Sun, Building2, Flame } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleStartOpnamen = () => {
    router.push('/opnamen/algemeen');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#B7D840] rounded-full"></div>
              <span className="text-xl font-bold text-gray-800">GACS Platform</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#waarom" className="text-gray-600 hover:text-[#7BA800]">Waarom deze tool</a>
              <a href="#voorbeelden" className="text-gray-600 hover:text-[#7BA800]">Voorbeelden</a>
              <a href="#doorontwikkeling" className="text-gray-600 hover:text-[#7BA800]">Doorontwikkeling</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleStartOpnamen}
                className="px-4 py-2 bg-[#B7D840] text-[#222] rounded-md hover:bg-[#A0C52F] transition-colors duration-200 font-medium"
              >
                Start opnamen
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text and Buttons */}
            <div>
                                   <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Meer rendement met GACS
          </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Het GACS-platform, een samenwerking tussen Techniek Nederland, TVVL en FHI, heeft tot doel om meer duidelijkheid te brengen aan welke eisen een Gebouw Automatisering en Controle Systemen (GACS) moet voldoen om een optimale energie-efficiëntie te behalen én te voldoen aan de regelgeving.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStartOpnamen}
                  className="w-64 px-8 py-3 bg-[#B7D840] text-[#222] rounded-md hover:bg-[#A0C52F] transition-colors duration-200 font-bold text-lg border border-[#B7D840] shadow-sm"
                >
                  Ontdek de GACS tool
                </button>
                <a
                  href="https://tvvl.nl/evenement/tvvl-masterclass-gacs-voor-technici-en-installateurs-8/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-64 px-8 py-3 bg-[#484848] text-white rounded-md hover:bg-[#222] transition-colors duration-200 font-bold text-lg text-center"
                >
                  Training volgen?
                </a>
              </div>
            </div>

            {/* Right Column - Image/Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#B7D840] to-[#7BA800] rounded-lg p-8 text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-2xl font-bold mb-4">Gratis GACS Tool</h3>
                  <p className="text-lg mb-6">
                    Beschikbaar gemaakt voor de markt door{' '}
                    <a href="https://tvvl.nl/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                      TVVL
                    </a>
                    {' '}&{' '}
                    <a href="https://www.technieknederland.nl/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                      Techniek NL
                    </a>
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/20 rounded p-3">
                      <div className="font-semibold">7 Onderdelen</div>
                      <div>Complete audit</div>
                    </div>
                    <div className="bg-white/20 rounded p-3">
                      <div className="font-semibold">NEN Normen</div>
                      <div>52120 & 17609</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Gestandardiseerde audit op 7 onderdelen
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              De GACS audit tool bestaat uit geïntegreerde modules die samen zorgen voor een complete opnamen van de huidge situatie en concrete verbeterpunten aangeeft. Hiermee krijgt u een duidelijk beeld of een installatie voldoet of waar deze verbeterd moet worden
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {/* Eerste rij: 4 blokken */}
            {[
              {
                icon: <Flame size={32} color="#B7D840" />, // Verwarmingssysteem (vuur)
                title: 'Verwarmingssysteem onderdelen',
                desc: 'Audit van CV-ketels, warmtepompen, stadsverwarming en regelsystemen.'
              },
              {
                icon: <Droplets size={32} color="#B7D840" />, // Warm tapwater
                title: 'Warm tapwater onderdelen',
                desc: 'Analyse van boilers, circulatie, legionella preventie en temperatuurregeling.'
              },
              {
                icon: <Snowflake size={32} color="#B7D840" />, // Airconditioning
                title: 'Airconditioningssysteem onderdelen',
                desc: 'Evaluatie van split units, VRV/VRF systemen en centrale luchtbehandeling.'
              },
              {
                icon: <Wind size={32} color="#B7D840" />, // Ventilatie
                title: 'Ventilatiesysteem onderdelen',
                desc: 'Inspectie van mechanische ventilatie, balansventilatie en WTW-systemen.'
              }
            ].map((item, idx) => (
              <div key={idx} className="w-64 bg-[#F7F7F7] rounded-lg p-6 flex flex-col items-center text-center shadow-[0_2px_8px_0_rgba(183,216,64,0.10)]">
                <div className="w-14 h-14 flex items-center justify-center rounded-lg mb-4" style={{ background: '#484848' }}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#7BA800] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {/* Tweede rij: 3 blokken */}
            {[
              {
                icon: <Lightbulb size={32} color="#B7D840" />, // Verlichting
                title: 'Verlichtingssysteem onderdelen',
                desc: 'Analyse van verlichtingstype, aansturing, energielabels en daglichtregeling.'
              },
              {
                icon: <Sun size={32} color="#B7D840" />, // Zonwering
                title: 'Zonweringssystemen onderdelen',
                desc: 'Controle van rolluiken, screens, automatische regeling en integratie.'
              },
              {
                icon: <Building2 size={32} color="#B7D840" />, // Gebouwmanagement
                title: 'Technisch gebouwmanagement',
                desc: 'BMS integratie, alarmen, trending, rapportages en complete controle.'
              }
            ].map((item, idx) => (
              <div key={idx} className="w-64 bg-[#F7F7F7] rounded-lg p-6 flex flex-col items-center text-center shadow-[0_2px_8px_0_rgba(183,216,64,0.10)]">
                <div className="w-14 h-14 flex items-center justify-center rounded-lg mb-4" style={{ background: '#484848' }}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#7BA800] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bronnen Section */}
      <section className="py-16 bg-[#F6FBEF]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[#7BA800] mb-8 text-center">
              Gebaseerd op NEN Normen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 border border-[#B7D840]">
                <h3 className="font-semibold text-[#7BA800] mb-3">NEN-EN-ISO 52120-1:2022</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Energy performance of buildings - Contribution of building automation, controls and building management
                </p>
                <a 
                  href="https://www.nen.nl/nen-en-iso-52120-1-2022-en-294203" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#7BA800] hover:text-[#A0C52F] underline text-sm"
                >
                  Bekijk norm →
                </a>
              </div>
              <div className="bg-white rounded-lg p-6 border border-[#B7D840]">
                <h3 className="font-semibold text-[#7BA800] mb-3">NEN-EN 17609:2022</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Building automation and control systems - Control applications
                </p>
                <a 
                  href="https://www.nen.nl/nen-en-17609-2022-en-299526" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#7BA800] hover:text-[#A0C52F] underline text-sm"
                >
                  Bekijk norm →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waarom deze tool */}
      <section id="waarom" className="py-16 bg-white border-t border-[#F6FBEF]">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#7BA800] mb-6">Waarom deze tool?</h2>
          <p className="text-lg text-gray-700 mb-4">
            De GACS opnamen tool is ontwikkeld om het uitvoeren van gebouw- en installatiescans te standaardiseren en te vereenvoudigen. Door gebruik te maken van de nieuwste NEN-normen (zoals NEN-EN-ISO 52120 en NEN-EN 17609) kunnen gebouwaudits objectief, efficiënt en volledig worden uitgevoerd. Dit helpt gebouweigenaren, adviseurs en installateurs om te voldoen aan wet- en regelgeving en om energieprestaties en comfort te verbeteren.
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Standaardisatie van GACS-audits volgens de nieuwste normen</li>
            <li>Direct toepasbaar in de praktijk</li>
            <li>Gratis beschikbaar voor de markt</li>
            <li>Ondersteund door TVVL & Techniek NL</li>
          </ul>
        </div>
      </section>

      {/* Voorbeelden */}
      <section id="voorbeelden" className="py-16 bg-[#F6FBEF] border-t border-[#B7D840]">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#7BA800] mb-6">Voorbeelden</h2>
          <p className="text-lg text-gray-700 mb-4">
            Benieuwd hoe een GACS audit eruit ziet? Hieronder enkele voorbeelden van situaties en rapportages:
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Audit van een kantoorgebouw met meerdere verwarmings- en ventilatiezones</li>
            <li>Rapportage van een school met focus op energie-efficiëntie en comfort</li>
            <li>Voorbeeld van een PDF-rapportage met alle onderdelen en adviezen</li>
          </ul>
          <div className="mt-6 text-gray-500 text-sm">(Hier kunnen in de toekomst screenshots of downloadbare voorbeeldrapporten worden toegevoegd)</div>
        </div>
      </section>

      {/* Doorontwikkeling */}
      <section id="doorontwikkeling" className="py-16 bg-white border-t border-[#F6FBEF]">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#7BA800] mb-6">Doorontwikkeling</h2>
          <p className="text-lg text-gray-700 mb-4">
            De GACS tool wordt continu doorontwikkeld op basis van feedback uit de markt en nieuwe inzichten uit de normcommissies. Toekomstige uitbreidingen zijn onder andere:
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Automatische PDF-rapportage en export</li>
            <li>Koppeling met gebouwbeheersystemen (BMS)</li>
            <li>Uitbreiding met extra modules en maatwerkvragen</li>
            <li>Meer praktijkvoorbeelden en best practices</li>
          </ul>
          <div className="mt-6 text-gray-500 text-sm">Heb je suggesties? Neem contact op met TVVL of Techniek NL.</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#484848] text-white mt-16">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row md:justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="font-bold text-lg mb-1">TVVL</div>
            <div>Vlinderweg 6</div>
            <div>2623 AX Delft</div>
            <div>Nederland</div>
          </div>
          <div className="text-center md:text-right text-sm">
            <div>Telefoon: <a href="tel:+31152690391" className="underline hover:text-[#B7D840]">015 2 690 391</a></div>
            <div>Email: <a href="mailto:klantenservice@tvvl.nl" className="underline hover:text-[#B7D840]">klantenservice@tvvl.nl</a></div>
            <div className="mt-2">&copy; {new Date().getFullYear()} TVVL</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
