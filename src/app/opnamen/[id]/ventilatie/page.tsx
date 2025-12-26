'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TimelineNavigation from '@/components/TimelineNavigation';
import Header from '@/components/Header';
import { useOpnameId } from '@/lib/useOpname';
import { saveAnswersToDatabase } from '@/lib/save-answers';
import { uploadPhotoToDatabase } from '@/lib/photo-handler';
import { deleteSectieFoto } from '@/lib/opname-api';

interface BuildingData {
  buildingName: string;
  address: string;
  buildingType: string;
  contactPerson: string;
  date: string;
}

export default function VentilatiePage() {
  const params = useParams();
  const opnameId = params?.id as string;
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<Map<string, File>>(new Map());
  const [photoIds, setPhotoIds] = useState<Map<string, string>>(new Map()); // Map van vraagId -> fotoId
  const router = useRouter();
  const [, setOpnameId] = useOpnameId();

  useEffect(() => {
    if (opnameId) {
      setOpnameId(opnameId);
    }
  }, [opnameId, setOpnameId]);

  const questions = [
    // Sectie 1: Regeling van ventilatiestroom in de ruimte
    {
      id: 'ventilatiestroom_van_toepassing',
      question: 'Vraag 1.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '1 - Regeling van ventilatiestroom in de ruimte'
    },
    {
      id: 'ventilatiestroom_regeling',
      question: 'Vraag 1.2 - Hoe is de regeling van ventilatiestroom in de ruimte?',
      type: 'select',
      options: [
        'Geen automatische controle',
        'Tijd gestuurde regeling',
        'Aanwezigheidsdetectie',
        'Vraag gestuurde regeling'
      ],
      conditional: 'ventilatiestroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling van ventilatiestroom in de ruimte'
    },    {
      id: 'ventilatiestroom_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'ventilatiestroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling van ventilatiestroom in de ruimte'
    },
    {
      id: 'ventilatiestroom_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'ventilatiestroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling van ventilatiestroom in de ruimte'
    },

    {
      id: 'ventilatiestroom_verbetermaatregel',
      question: 'Vraag 1.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'ventilatiestroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '1 - Regeling van ventilatiestroom in de ruimte'
    },
    // Sectie 2: Temperatuurregeling in de ruimte (luchtsystemen)
    {
      id: 'temperatuur_lucht_van_toepassing',
      question: 'Vraag 2.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '2 - Temperatuurregeling in de ruimte (luchtsystemen)'
    },
    {
      id: 'temperatuur_lucht_regeling',
      question: 'Vraag 2.2 - Hoe is de temperatuurregeling in de ruimte (luchtsystemen)?',
      type: 'select',
      options: [
        'Aan-uit regeling',
        'Variabele regeling',
        'Vraag gestuurde regeling'
      ],
      conditional: 'temperatuur_lucht_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Temperatuurregeling in de ruimte (luchtsystemen)'
    },    {
      id: 'temperatuur_lucht_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'temperatuur_lucht_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Temperatuurregeling in de ruimte (luchtsystemen)'
    },
    {
      id: 'temperatuur_lucht_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'temperatuur_lucht_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Temperatuurregeling in de ruimte (luchtsystemen)'
    },

    {
      id: 'temperatuur_lucht_verbetermaatregel',
      question: 'Vraag 2.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'temperatuur_lucht_van_toepassing',
      conditionalValue: 'Ja',
      section: '2 - Temperatuurregeling in de ruimte (luchtsystemen)'
    },
    // Sectie 3: Temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)
    {
      id: 'temperatuur_gecombineerd_van_toepassing',
      question: 'Vraag 3.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '3 - Temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)'
    },
    {
      id: 'temperatuur_gecombineerd_regeling',
      question: 'Vraag 3.2 - Hoe is de temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)?',
      type: 'select',
      options: [
        'Geen afstemming',
        'Afstemming'
      ],
      conditional: 'temperatuur_gecombineerd_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)'
    },    {
      id: 'temperatuur_gecombineerd_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'temperatuur_gecombineerd_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)'
    },
    {
      id: 'temperatuur_gecombineerd_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'temperatuur_gecombineerd_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)'
    },

    {
      id: 'temperatuur_gecombineerd_verbetermaatregel',
      question: 'Vraag 3.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'temperatuur_gecombineerd_van_toepassing',
      conditionalValue: 'Ja',
      section: '3 - Temperatuurregeling in de ruimte (gecombineerde lucht-watersystemen)'
    },
    // Sectie 4: Buitenluchtstroom regeling
    {
      id: 'buitenluchtstroom_van_toepassing',
      question: 'Vraag 4.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '4 - Buitenluchtstroom regeling'
    },
    {
      id: 'buitenluchtstroom_regeling',
      question: 'Vraag 4.2 - Hoe is de buitenluchtstroom regeling?',
      type: 'select',
      options: [
        'Vaste verhouding buitenluchtstroom',
        'Tijd gestuurde getrapte regeling verhouding buitenlucht',
        'Vraag gestuurde getrapte regeling verhouding buitenlucht',
        'Variabele regeling'
      ],
      conditional: 'buitenluchtstroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Buitenluchtstroom regeling'
    },    {
      id: 'buitenluchtstroom_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'buitenluchtstroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Buitenluchtstroom regeling'
    },
    {
      id: 'buitenluchtstroom_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'buitenluchtstroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Buitenluchtstroom regeling'
    },

    {
      id: 'buitenluchtstroom_verbetermaatregel',
      question: 'Vraag 4.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'buitenluchtstroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '4 - Buitenluchtstroom regeling'
    },
    // Sectie 5: Luchtstroom of luchtdrukregeling van air handeling unit
    {
      id: 'luchtstroom_van_toepassing',
      question: 'Vraag 5.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '5 - Luchtstroom of luchtdrukregeling van air handeling unit'
    },
    {
      id: 'luchtstroom_regeling',
      question: 'Vraag 5.2 - Hoe is de luchtstroom of luchtdrukregeling van air handeling unit?',
      type: 'select',
      options: [
        'Geen automatische regeling',
        'Tijd gestuurde aan-uit regeling',
        'Multi stap regeling',
        'Automatische luchtstroom of drukregeling (met of zonder reset)'
      ],
      conditional: 'luchtstroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '5 - Luchtstroom of luchtdrukregeling van air handeling unit'
    },    {
      id: 'luchtstroom_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'luchtstroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '5 - Luchtstroom of luchtdrukregeling van air handeling unit'
    },
    {
      id: 'luchtstroom_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'luchtstroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '5 - Luchtstroom of luchtdrukregeling van air handeling unit'
    },

    {
      id: 'luchtstroom_verbetermaatregel',
      question: 'Vraag 5.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'luchtstroom_van_toepassing',
      conditionalValue: 'Ja',
      section: '5 - Luchtstroom of luchtdrukregeling van air handeling unit'
    },
    // Sectie 6: Warmte terugwinning: vorstbescherming
    {
      id: 'vorstbescherming_van_toepassing',
      question: 'Vraag 6.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '6 - Warmte terugwinning: vorstbescherming'
    },
    {
      id: 'vorstbescherming_regeling',
      question: 'Vraag 6.2 - Hoe is de warmte terugwinning vorstbescherming?',
      type: 'select',
      options: [
        'Zonder vorstbescherming',
        'Met vorstbescherming'
      ],
      conditional: 'vorstbescherming_van_toepassing',
      conditionalValue: 'Ja',
      section: '6 - Warmte terugwinning: vorstbescherming'
    },    {
      id: 'vorstbescherming_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'vorstbescherming_van_toepassing',
      conditionalValue: 'Ja',
      section: '6 - Warmte terugwinning: vorstbescherming'
    },
    {
      id: 'vorstbescherming_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'vorstbescherming_van_toepassing',
      conditionalValue: 'Ja',
      section: '6 - Warmte terugwinning: vorstbescherming'
    },

    {
      id: 'vorstbescherming_verbetermaatregel',
      question: 'Vraag 6.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'vorstbescherming_van_toepassing',
      conditionalValue: 'Ja',
      section: '6 - Warmte terugwinning: vorstbescherming'
    },
    // Sectie 7: Warmte terugwinning: oververhitting bescherming
    {
      id: 'oververhitting_van_toepassing',
      question: 'Vraag 7.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '7 - Warmte terugwinning: oververhitting bescherming'
    },
    {
      id: 'oververhitting_regeling',
      question: 'Vraag 7.2 - Hoe is de warmte terugwinning oververhitting bescherming?',
      type: 'select',
      options: [
        'Zonder oververhitting bescherming',
        'Met oververhitting bescherming'
      ],
      conditional: 'oververhitting_van_toepassing',
      conditionalValue: 'Ja',
      section: '7 - Warmte terugwinning: oververhitting bescherming'
    },    {
      id: 'oververhitting_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'oververhitting_van_toepassing',
      conditionalValue: 'Ja',
      section: '7 - Warmte terugwinning: oververhitting bescherming'
    },
    {
      id: 'oververhitting_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'oververhitting_van_toepassing',
      conditionalValue: 'Ja',
      section: '7 - Warmte terugwinning: oververhitting bescherming'
    },

    {
      id: 'oververhitting_verbetermaatregel',
      question: 'Vraag 7.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'oververhitting_van_toepassing',
      conditionalValue: 'Ja',
      section: '7 - Warmte terugwinning: oververhitting bescherming'
    },
    // Sectie 8: Vrije koeling
    {
      id: 'vrije_koeling_van_toepassing',
      question: 'Vraag 8.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '8 - Vrije koeling'
    },
    {
      id: 'vrije_koeling_regeling',
      question: 'Vraag 8.2 - Hoe is de vrije koeling geregeld?',
      type: 'select',
      options: [
        'Geen automatische regeling',
        'Nachtkoeling',
        'Vrije koeling',
        'HX gestuurde regeling (=modulerende regeling)'
      ],
      conditional: 'vrije_koeling_van_toepassing',
      conditionalValue: 'Ja',
      section: '8 - Vrije koeling'
    },    {
      id: 'vrije_koeling_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'vrije_koeling_van_toepassing',
      conditionalValue: 'Ja',
      section: '8 - Vrije koeling'
    },
    {
      id: 'vrije_koeling_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'vrije_koeling_van_toepassing',
      conditionalValue: 'Ja',
      section: '8 - Vrije koeling'
    },

    {
      id: 'vrije_koeling_verbetermaatregel',
      question: 'Vraag 8.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'vrije_koeling_van_toepassing',
      conditionalValue: 'Ja',
      section: '8 - Vrije koeling'
    },
    // Sectie 9: Regeling ventilatie temperatuur
    {
      id: 'ventilatie_temperatuur_van_toepassing',
      question: 'Vraag 9.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '9 - Regeling ventilatie temperatuur'
    },
    {
      id: 'ventilatie_temperatuur_regeling',
      question: 'Vraag 9.2 - Hoe is de regeling ventilatie temperatuur?',
      type: 'select',
      options: [
        'Geen automatische controle',
        'Constante temperatuurinstelling',
        'Variabele temperatuurinstelling met buitentemperatuur correctie',
        'Variabele temperatuurinstelling met vraaggestuurde correctie'
      ],
      conditional: 'ventilatie_temperatuur_van_toepassing',
      conditionalValue: 'Ja',
      section: '9 - Regeling ventilatie temperatuur'
    },    {
      id: 'ventilatie_temperatuur_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'ventilatie_temperatuur_van_toepassing',
      conditionalValue: 'Ja',
      section: '9 - Regeling ventilatie temperatuur'
    },
    {
      id: 'ventilatie_temperatuur_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'ventilatie_temperatuur_van_toepassing',
      conditionalValue: 'Ja',
      section: '9 - Regeling ventilatie temperatuur'
    },

    {
      id: 'ventilatie_temperatuur_verbetermaatregel',
      question: 'Vraag 9.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'ventilatie_temperatuur_van_toepassing',
      conditionalValue: 'Ja',
      section: '9 - Regeling ventilatie temperatuur'
    },
    // Sectie 10: Regeling luchtvochtigheid
    {
      id: 'luchtvochtigheid_van_toepassing',
      question: 'Vraag 10.1 - Van toepassing?',
      type: 'radio',
      options: ['Ja', 'Nee'],
      section: '10 - Regeling luchtvochtigheid'
    },
    {
      id: 'luchtvochtigheid_regeling',
      question: 'Vraag 10.2 - Hoe is de regeling luchtvochtigheid?',
      type: 'select',
      options: [
        'Geen automatische controle',
        'Dauwpuntregeling',
        'Directe regeling luchtvochtigheid'
      ],
      conditional: 'luchtvochtigheid_van_toepassing',
      conditionalValue: 'Ja',
      section: '10 - Regeling luchtvochtigheid'
    },
    {
      id: 'luchtvochtigheid_foto',
      question: 'Foto uploaden',
      type: 'file',
      conditional: 'luchtvochtigheid_van_toepassing',
      conditionalValue: 'Ja',
      section: '10 - Regeling luchtvochtigheid'
    },
    {
      id: 'luchtvochtigheid_notities',
      question: 'Notities over de opnamen',
      type: 'textarea',
      conditional: 'luchtvochtigheid_van_toepassing',
      conditionalValue: 'Ja',
      section: '10 - Regeling luchtvochtigheid'
    },

        {
      id: 'luchtvochtigheid_verbetermaatregel',
      question: 'Vraag 10.3 - Te nemen verbetermaatregel',
      type: 'select',
      options: [
        'Naar klasse C',
        'Naar klasse B',
        'Naar klasse A'
      ],
      conditional: 'luchtvochtigheid_van_toepassing',
      conditionalValue: 'Ja',
      section: '10 - Regeling luchtvochtigheid'
    }
  ];

  useEffect(() => {
    if (opnameId) {
      loadAnswersFromDatabase();
    } else {
      // Fallback naar localStorage voor backward compatibility
    const savedBuildingData = localStorage.getItem('gacsBuildingData');
    if (savedBuildingData) {
      setBuildingData(JSON.parse(savedBuildingData));
    }

    const savedAnswers = localStorage.getItem('gacsOpnamenData');
    if (savedAnswers) {
      const parsedAnswers = JSON.parse(savedAnswers);
      if (parsedAnswers.ventilatie) {
        setAnswers(parsedAnswers.ventilatie);
      }
    }
    }
  }, [opnameId]);

  const loadAnswersFromDatabase = async () => {
    if (!opnameId) return;

    try {
      // Laad alle data in één keer via de opname endpoint
      const opnameResponse = await fetch(`/api/opnamen/${opnameId}`);
      if (!opnameResponse.ok) {
        throw new Error('Fout bij ophalen opname data');
      }

      const opnameData = await opnameResponse.json();
      
      // Laad building data
      setBuildingData({
        buildingName: opnameData.gebouwnaam || '',
        address: opnameData.adres || '',
        buildingType: opnameData.gebouwtype || '',
        contactPerson: opnameData.contactpersoon || '',
        date: opnameData.datum_opname ? new Date(opnameData.datum_opname).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });

      // Laad antwoorden en foto's
      const loadedAnswers: Record<string, string> = {};
      
      // Laad antwoorden
      if (opnameData.antwoorden) {
        opnameData.antwoorden
          .filter((antwoord: any) => antwoord.sectie_naam === 'ventilatie')
          .forEach((antwoord: any) => {
            if (antwoord.antwoord_waarde) {
              loadedAnswers[antwoord.vraag_id] = antwoord.antwoord_waarde;
            } else if (antwoord.antwoord_nummer !== null) {
              loadedAnswers[antwoord.vraag_id] = String(antwoord.antwoord_nummer);
            } else if (antwoord.antwoord_boolean !== null) {
              loadedAnswers[antwoord.vraag_id] = antwoord.antwoord_boolean ? 'true' : 'false';
            }
          });
      }
      
      // Laad sectie foto's
      const fotoIdsMap = new Map<string, string>();
      if (opnameData.sectieFotos) {
        opnameData.sectieFotos
          .filter((foto: any) => foto.sectie_naam === 'ventilatie')
          .forEach((foto: any) => {
            if (foto.vraag_id && foto.bestandspad) {
              loadedAnswers[foto.vraag_id] = foto.bestandspad.replace(/^public\//, '/');
              if (foto.id) {
                fotoIdsMap.set(foto.vraag_id, foto.id);
              }
            }
          });
      }
      setPhotoIds(fotoIdsMap);
      
      setAnswers(loadedAnswers);
    } catch (error) {
      console.error('Fout bij laden antwoorden:', error);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Alleen naar localStorage schrijven als er geen opnameId is (backward compatibility)
    if (!opnameId) {
      try {
    const existingData = localStorage.getItem('gacsOpnamenData');
    const parsedData = existingData ? JSON.parse(existingData) : {};
    parsedData.ventilatie = newAnswers;
    localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
      } catch (error) {
        console.error('localStorage quota exceeded:', error);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const allData = {
        ...answers,
        section: 'ventilatie',
        timestamp: new Date().toISOString()
      };
      
      await saveAnswersToDatabase(
        opnameId,
        'ventilatie',
        allData,
        questions,
        'basis'
      );
    } catch (error) {
      console.error('Fout bij opslaan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSave();
    router.push(`/opnamen/${opnameId}/verlichting`);
  };

  const handlePrevious = async () => {
    await handleSave();
    router.push(`/opnamen/${opnameId}/airconditioning`);
  };

  const renderQuestion = (question: Record<string, unknown>) => {
    // Check if this question should be shown based on conditional logic
    if (question.conditional && question.conditionalValue) {
      const conditionalAnswer = answers[question.conditional as string];
      if (conditionalAnswer !== question.conditionalValue) {
        return null; // Don't render this question
      }
    }

    const currentAnswer = (answers[question.id as string] as string) || '';

    switch (question.type) {
      case 'select':
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="">Selecteer een optie</option>
            {(question.options as string[])?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {(question.options as string[])?.map((option: string) => (
              <label key={option} className="flex items-center space-x-2 font-bold">
                <input
                  type="radio"
                  name={question.id as string}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
                  className="text-[#343234] focus:ring-green-500"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            rows={4}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            placeholder="Voer uw antwoord in..."
          />
        );

            case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Sla File object op voor database upload
                  setPhotoFiles(prev => new Map(prev).set(question.id as string, file));
                  
                  // Toon preview (base64 voor display)
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    handleAnswerChange(question.id as string, event.target?.result as string);
                  };
                  reader.readAsDataURL(file);

                  // Upload direct naar database als opnameId beschikbaar is
                  if (opnameId) {
                    try {
                      await uploadPhotoToDatabase(
                        opnameId,
                        'ventilatie',
                        file,
                        question.id as string
                      );
                    } catch (error) {
                      console.error('Fout bij direct uploaden foto:', error);
                      // Foto wordt later geüpload bij handleSave
                    }
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c7d316] focus:border-transparent bg-white text-gray-900"
            />
            {currentAnswer && (
              <div className="mt-2 relative">
                <img 
                  src={currentAnswer} 
                  alt="Uploaded" 
                  className="max-w-xs h-32 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleAnswerChange(question.id as string, '');
                    setPhotoFiles(prev => {
                      const newMap = new Map(prev);
                      newMap.delete(question.id as string);
                      return newMap;
                    });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                  title="Verwijder foto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id as string, e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Voer uw antwoord in..."
          />
        );
    }
  };

  if (!buildingData) {
    return <div>Loading...</div>;
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
                  <span className="text-[#343234] font-bold text-lg">4</span>
                </div>
                <h1 className="text-xl font-bold text-[#343234]">
                  Ventilatie onderdelen
                </h1>
              </div>
              <div className="bg-[#c7d316]/10 text-[#343234] px-3 py-1 rounded-full text-sm font-medium">
                {Object.keys(questions.reduce((acc, question) => {
                  const section = question.section || 'Overig';
                  acc[section] = true;
                  return acc;
                }, {} as Record<string, boolean>)).length} secties
              </div>
            </div>
            
            <div className="p-8">
              {/* All Questions */}
              <div className="space-y-8">
                {(() => {
                  // Group questions by section
                  const groupedQuestions = questions.reduce((acc, question) => {
                    const section = question.section || 'Overig';
                    if (!acc[section]) {
                      acc[section] = [];
                    }
                    acc[section].push(question);
                    return acc;
                  }, {} as Record<string, typeof questions>);

                  return Object.entries(groupedQuestions).map(([sectionName, sectionQuestions]) => (
                    <div key={sectionName} className="pb-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-[#343234] mb-6">
                        {sectionName}
                      </h2>
                      <div className="space-y-6">
                        {sectionQuestions.map((question) => {
                          const renderedQuestion = renderQuestion(question);
                          if (!renderedQuestion) return null;
                          
                          return (
                            <div key={question.id as string} className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="text-lg font-semibold text-[#343234] mb-4">
                                {question.question}
                              </h3>
                              
                              <div className="mb-4">
                                {renderedQuestion}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="flex justify-center mt-8 pt-6 border-t border-gray-200 space-x-4">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 bg-[#343234] text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2 font-bold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Vorige onderdeel</span>
                </button>
                
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[#c7d314] text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 font-bold"
                >
                  <span>Volgende onderdeel</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 