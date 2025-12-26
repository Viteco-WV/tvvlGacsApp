# Update Overige Pagina's voor Database Opslag

De volgende pagina's moeten nog worden aangepast om data naar de database te sturen:

## Al aangepast:
- ✅ `/opnamen/algemeen` - Maakt opname aan in database
- ✅ `/opnamen/zonwering` - Slaat antwoorden op in database
- ✅ `/opnamen/warm-tapwater` - Slaat antwoorden op in database

## Nog aan te passen:

### Basis Opnamen:
1. `/opnamen/verwarmingssysteem` - Verwarmingssysteem sectie
2. `/opnamen/ventilatie` - Ventilatie sectie
3. `/opnamen/verlichting` - Verlichting sectie
4. `/opnamen/airconditioning` - Airconditioning sectie
5. `/opnamen/gebouwmanagement` - Gebouwmanagement sectie

### Geavanceerde Opnamen:
6. `/opnamen-geavanceerd/algemeen` - Algemene gegevens (geavanceerd)
7. `/opnamen-geavanceerd/ruimtetypes` - Ruimtetypes
8. `/opnamen-geavanceerd/distributie` - Distributie
9. `/opnamen-geavanceerd/opwekking` - Opwekking
10. `/opnamen-geavanceerd/systeem` - Systeem
11. `/opnamen-geavanceerd/details` - Details
12. `/opnamen-geavanceerd/afronden` - Afronden

## Stappen voor elke pagina:

1. **Import toevoegen:**
```typescript
import { useOpnameId } from '@/lib/useOpname';
import { saveAnswersToDatabase } from '@/lib/save-answers';
```

2. **State toevoegen:**
```typescript
const [opnameId] = useOpnameId();
const [isSaving, setIsSaving] = useState(false);
```

3. **handleSave aanpassen:**
```typescript
const handleSave = async () => {
  setIsSaving(true);
  try {
    const allData = {
      ...answers,
      section: 'sectie_naam',
      timestamp: new Date().toISOString()
    };
    
    await saveAnswersToDatabase(
      opnameId,
      'sectie_naam', // vervang met juiste sectie naam
      allData,
      questions,
      'basis' // of 'geavanceerd'
    );
  } catch (error) {
    console.error('Fout bij opslaan:', error);
  } finally {
    setIsSaving(false);
  }
};
```

4. **handleNext/Previous aanpassen:**
```typescript
const handleNext = async () => {
  await handleSave();
  router.push('/opnamen/volgende-pagina');
};
```

5. **handleAnswerChange aanpassen (optioneel, voor backward compatibility):**
```typescript
const handleAnswerChange = (questionId: string, value: string) => {
  setAnswers(prev => ({
    ...prev,
    [questionId]: value
  }));
  
  // Backward compatibility
  const existingData = localStorage.getItem('gacsOpnamenData');
  const parsedData = existingData ? JSON.parse(existingData) : {};
  parsedData.sectie_naam = { ...answers, [questionId]: value };
  localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
};
```

## Sectie Namen Mapping:

- `verwarmingssysteem` → 'verwarmingssysteem'
- `warmTapwater` → 'warmTapwater'
- `ventilatie` → 'ventilatie'
- `verlichting` → 'verlichting'
- `airconditioning` → 'airconditioning'
- `zonwering` → 'zonwering'
- `gebouwmanagement` → 'gebouwmanagement'

## Foto Upload:

Voor pagina's met foto uploads, gebruik:
```typescript
import { uploadSectieFoto } from '@/lib/opname-api';

// In handleSave, na saveAnswersToDatabase:
if (photoFile && opnameId) {
  await uploadSectieFoto(opnameId, 'sectie_naam', photoFile, 'vraag_id');
}
```

