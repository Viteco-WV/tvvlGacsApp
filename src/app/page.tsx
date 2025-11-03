'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Droplets, Snowflake, Wind, Lightbulb, Sun, Building2, Flame } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleStartOpnamen = () => {
    router.push('/opnamen');
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Toon header bij omhoog scrollen, verberg bij omlaag scrollen
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`sticky top-0 z-50 bg-white shadow-sm border-b transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
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
              <a href="#whitepapers" className="text-gray-600 hover:text-[#7BA800] font-semibold">Whitepapers</a>
              <a href="#voorbeelden" className="text-gray-600 hover:text-[#7BA800] font-semibold">Voorbeelden</a>
              <a href="#contact" className="text-gray-600 hover:text-[#7BA800] font-semibold">Doorontwikkeling</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleStartOpnamen}
                className="px-4 py-2 bg-[#B7D840] text-[#222] rounded-md hover:bg-[#A0C52F] transition-colors duration-200 font-bold"
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
            <div className="rounded-lg p-8 text-white shadow-md" style={{ backgroundColor: '#4287f5' }}>
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Standaardisatie</h3>
                <p className="text-sm opacity-90">GACS-audits volgens de nieuwste normen</p>
              </div>
            </div>

            <div className="rounded-lg p-8 text-white shadow-md" style={{ backgroundColor: '#f9824a' }}>
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Direct toepasbaar</h3>
                <p className="text-sm opacity-90">In de praktijk direct te gebruiken</p>
              </div>
            </div>

            <div className="rounded-lg p-8 text-white shadow-md" style={{ backgroundColor: '#bed73b' }}>
                <div className="text-center">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                    </div>
                <h3 className="text-lg font-bold mb-2">Onafhankelijk</h3>
                <p className="text-sm opacity-90">Door experts voor de markt</p>
                    </div>
                  </div>

            <div className="rounded-lg p-8 text-white shadow-md" style={{ backgroundColor: '#75598f' }}>
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Ondersteund</h3>
                <p className="text-sm opacity-90">Door TVVL & Techniek NL</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gebaseerd op NEN Normen Section */}
      <section className="py-16 bg-[#F6FBEF]">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Gebaseerd op NEN Normen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* NEN Norm 1 */}
            <a 
              href="https://www.nen.nl/nen-en-iso-52120-1-2022-en-294203" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-[#c7d316] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <svg className="w-12 h-12 text-[#c7d316] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#7BA800] transition-colors">
                  NEN-EN-ISO 52120-1:2022
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Energy performance of buildings - Contribution of building automation, controls and building management
                </p>
                <div className="flex items-center text-[#7BA800] font-medium text-sm">
                  <span>Bekijk norm</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* NEN Norm 2 */}
            <a 
              href="https://www.nen.nl/nen-en-17609-2022-en-299526" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-[#c7d316] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <svg className="w-12 h-12 text-[#c7d316] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#7BA800] transition-colors">
                  NEN-EN 17609:2022
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Building automation and control systems - Control applications
                </p>
                <div className="flex items-center text-[#7BA800] font-medium text-sm">
                  <span>Bekijk norm</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
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
              <div key={idx} className="w-full sm:w-64 bg-[#F7F7F7] rounded-lg p-6 flex flex-col items-center text-center shadow-[0_2px_8px_0_rgba(183,216,64,0.10)]">
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
              <div key={idx} className="w-full sm:w-64 bg-[#F7F7F7] rounded-lg p-6 flex flex-col items-center text-center shadow-[0_2px_8px_0_rgba(183,216,64,0.10)]">
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

      {/* Whitepapers */}
      <section id="whitepapers" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Raadpleeg ook de whitepapers van TVVL</h2>
          <p className="text-lg text-gray-700 mb-8 text-center max-w-3xl mx-auto">
            Voor uitgebreide informatie over GACS en de ISO 52120-1 norm, raadpleeg de volgende whitepapers van TVVL:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Whitepaper 1 */}
            <a 
              href="https://tvvl.nl/wp-content/uploads/2024/10/GACS-white-paper-Gebouweigenaren-en-beheerders.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-[#c7d316] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <svg className="w-12 h-12 text-[#c7d316] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#7BA800] transition-colors">
                  GACS voor eigenaren en beheerders
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Informatie en aanbevelingen voor gebouweigenaren en -beheerders
                </p>
                <div className="flex items-center text-[#7BA800] font-medium text-sm">
                  <span>Download PDF</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Whitepaper 2 */}
            <a 
              href="https://tvvl.nl/wp-content/uploads/2024/10/GACS-white-paper-Technieksector.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-[#c7d316] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <svg className="w-12 h-12 text-[#c7d316] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#7BA800] transition-colors">
                  GACS voor adviseurs en installateurs
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Informatie en aanbevelingen voor de technieksector
                </p>
                <div className="flex items-center text-[#7BA800] font-medium text-sm">
                  <span>Download PDF</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Whitepaper 3 */}
            <a 
              href="https://tvvl.nl/wp-content/uploads/2024/10/GACS-en-ISO-52120-1-interpretatie-document-NL.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-[#c7d316] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <svg className="w-12 h-12 text-[#c7d316] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#7BA800] transition-colors">
                  GACS normen vanuit ISO 52120-1
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Interpretatie document voor de Nederlandse markt
                </p>
                <div className="flex items-center text-[#7BA800] font-medium text-sm">
                  <span>Download PDF</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Voorbeelden */}
      <section id="voorbeelden" className="py-16 bg-[#F6FBEF]">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Voorbeelden</h2>
          <p className="text-lg text-gray-700 mb-12 text-center max-w-3xl mx-auto">
            Benieuwd hoe een GACS audit eruit ziet? Hieronder enkele voorbeelden van gebouwen waar GACS-audits zijn uitgevoerd:
          </p>
          
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Voorbeeld 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gray-300 overflow-hidden">
                <img 
                  src="/kantoorgebouw.jpeg" 
                  alt="Kantoorgebouw"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Kantoorgebouw</h3>
                <p className="text-sm text-gray-600 mb-2">Bouwjaar 2018</p>
                <p className="text-sm text-gray-500">15.000 m² · Energielabel A+</p>
              </div>
            </div>

            {/* Voorbeeld 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gray-300 overflow-hidden">
                <img 
                  src="/distributiecentra.avif" 
                  alt="Distributiecentra"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Distributiecentra</h3>
                <p className="text-sm text-gray-600 mb-2">Bouwjaar 2020</p>
                <p className="text-sm text-gray-500">9.700 m² · Energielabel A+</p>
              </div>
            </div>

            {/* Voorbeeld 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gray-300 overflow-hidden">
                <img 
                  src="/zorgcomplex.jpg" 
                  alt="Zorgcomplex"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Zorgcomplex</h3>
                <p className="text-sm text-gray-600 mb-2">Bouwjaar 2015</p>
                <p className="text-sm text-gray-500">30.000 m² · Energielabel A</p>
              </div>
            </div>

            {/* Voorbeeld 4 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gray-300 overflow-hidden">
                <img 
                  src="/zwembad.avif" 
                  alt="Zwembad"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Zwembad</h3>
                <p className="text-sm text-gray-600 mb-2">Bouwjaar 2019</p>
                <p className="text-sm text-gray-500">12.000 m² · Energielabel A+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vragen & Doorontwikkeling */}
      <section id="contact" className="py-16 bg-white border-t border-[#F6FBEF]">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Vragen & doorontwikkeling</h2>
          <p className="text-lg text-gray-700 mb-8 text-center max-w-3xl mx-auto">
            Heeft u vragen over de GACS tool? Neem gerust contact met ons op. Bij ideeën voor doorontwikkeling horen wij het graag!
          </p>

          {/* Contactformulier - gecentreerd en breder */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Neem contact op</h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Naam *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c7d316] focus:border-transparent text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c7d316] focus:border-transparent text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Onderwerp *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c7d316] focus:border-transparent text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Bericht *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c7d316] focus:border-transparent text-gray-900 bg-white"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                    Bijlage (optioneel)
                  </label>
                  <input
                    type="file"
                    id="attachment"
                    accept=".pdf"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c7d316] focus:border-transparent text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#c7d316] file:text-[#343234] hover:file:bg-[#b3c014] file:cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF bestand, maximaal 5MB</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#c7d316] text-[#343234] font-bold py-3 px-6 rounded-md hover:bg-[#b3c014] transition-colors duration-200"
                >
                  Verstuur bericht
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4d4d4d] text-white mt-16">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row md:justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="font-bold text-lg mb-1">TVVL</div>
            <div>Korenmolenlaan 4</div>
            <div>3447 GG Woerden</div>
            <div>Nederland</div>
          </div>
          <div className="text-center text-sm">
            <div>&copy; TVVL | <a href="https://tvvl.nl/algemene-voorwaarden/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#B7D840]">Algemene voorwaarden</a> | <a href="https://tvvl.nl/privacy-policy-tvvl/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#B7D840]">Privacy policy</a></div>
          </div>
          <div className="text-center md:text-right text-sm">
            <div>Telefoon: <a href="tel:+31884010600" className="underline hover:text-[#B7D840]">088 401 06 00</a></div>
            <div>Email: <a href="mailto:info@tvvl.nl" className="underline hover:text-[#B7D840]">info@tvvl.nl</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
