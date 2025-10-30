'use client';

import { useRouter } from 'next/navigation';
import { Droplets, Snowflake, Wind, Lightbulb, Sun, Building2, Flame } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleStartOpnamen = () => {
    router.push('/opnamen');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/TVVL-logo-los.png" 
                alt="TVVL Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-800">GACS Platform</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#waarom" className="text-gray-600 hover:text-[#7BA800] font-medium">Waarom deze tool</a>
              <a href="#voorbeelden" className="text-gray-600 hover:text-[#7BA800] font-medium">Voorbeelden</a>
              <a href="#doorontwikkeling" className="text-gray-600 hover:text-[#7BA800] font-medium">Doorontwikkeling</a>
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
      <section id="hero" className="bg-[#E8F5E0] py-20 lg:py-32">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text and Buttons */}
            <div className="text-center lg:text-left">
                                   <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                Meer rendement met een Gebouwautomatisering & Controle systeem
          </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Het GACS-platform, een samenwerking tussen Techniek Nederland, TVVL en FHI, heeft tot doel om meer duidelijkheid te brengen aan welke eisen een Gebouw Automatisering en Controle Systemen (GACS) moet voldoen om een optimale energie-efficiëntie te behalen én te voldoen aan de regelgeving.
              </p>
              <div className="flex flex-col md:flex-row items-center lg:items-start gap-4 w-full px-8 md:px-0 md:justify-center lg:justify-start">
                <button
                  onClick={handleStartOpnamen}
                  className="w-full sm:w-64 px-8 py-3 bg-[#B7D840] text-[#222] rounded-md hover:bg-[#A0C52F] transition-colors duration-200 font-bold text-lg border border-[#B7D840] shadow-sm"
                >
                  Ontdek de tool
                </button>
                <a
                  href="https://tvvl.nl/evenement/tvvl-masterclass-gacs-voor-technici-en-installateurs-8/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-64 px-8 py-3 bg-[#484848] text-white rounded-md hover:bg-[#222] transition-colors duration-200 font-bold text-lg text-center"
                >
                  Training volgen?
                </a>
              </div>
            </div>

            {/* Right Column - Image/Visual */}
            <div className="relative">
              <div className="rounded-lg overflow-hidden shadow-2xl max-h-[500px]">
                <img 
                  src="/skylineAmsterdamZuidas.jpg" 
                  alt="Amsterdam Zuidas Skyline - Moderne gebouwen" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waarom deze tool */}
      <section id="waarom" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Waarom de GACS tool?</h2>
          <p className="text-lg text-gray-700 mb-12 text-center max-w-4xl mx-auto">
            De GACS opnamen tool is ontwikkeld om het uitvoeren van gebouw- en installatiescans te standaardiseren en te vereenvoudigen. Door gebruik te maken van de nieuwste NEN-normen (zoals NEN-EN-ISO 52120 en NEN-EN 17609) kunnen gebouwaudits objectief, efficiënt en volledig worden uitgevoerd. Dit helpt gebouweigenaren, adviseurs en installateurs om te voldoen aan wet- en regelgeving en om energieprestaties en comfort te verbeteren.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-8 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Standaardisatie</h3>
                <p className="text-sm text-blue-100">GACS-audits volgens de nieuwste normen</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-8 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Direct toepasbaar</h3>
                <p className="text-sm text-orange-100">In de praktijk direct te gebruiken</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-8 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                    </div>
                <h3 className="text-lg font-bold mb-2">Gratis beschikbaar</h3>
                <p className="text-sm text-green-100">Voor de hele markt toegankelijk</p>
                    </div>
                  </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-8 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Ondersteund</h3>
                <p className="text-sm text-purple-100">Door TVVL & Techniek NL</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gebaseerd op NEN Normen Section */}
      <section className="py-16 bg-[#F6FBEF]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Gebaseerd op NEN Normen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#F7F7F7] rounded-lg p-6 shadow-[0_2px_8px_0_rgba(183,216,64,0.10)]">
                <h3 className="font-semibold text-gray-800 mb-3">NEN-EN-ISO 52120-1:2022</h3>
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
              <div className="bg-[#F7F7F7] rounded-lg p-6 shadow-[0_2px_8px_0_rgba(183,216,64,0.10)]">
                <h3 className="font-semibold text-gray-800 mb-3">NEN-EN 17609:2022</h3>
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

      {/* Gestandardiseerde audit op 7 onderdelen Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voorbeelden */}
      <section id="voorbeelden" className="py-16 bg-[#F6FBEF] border-t border-[#B7D840]">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Voorbeelden</h2>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Doorontwikkeling</h2>
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
