import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface BuildingData {
  buildingName: string;
  address: string;
  buildingType: string;
  energyLabel: string;
  contactPerson: string;
  date: string;
  photo?: string;
}

interface SectionData {
  [key: string]: unknown;
}

interface SectionPhoto {
  vraagId: string;
  bestandspad: string;
  beschrijving?: string;
}

interface OpnamenData {
  verwarmingssysteem?: SectionData;
  warmTapwater?: SectionData;
  airconditioning?: SectionData;
  ventilatie?: SectionData;
  verlichting?: SectionData;
  zonwering?: SectionData;
  gebouwmanagement?: SectionData;
}

interface SectionPhotos {
  [sectionName: string]: SectionPhoto[];
}

const sectionNames: Record<string, string> = {
  verwarmingssysteem: 'Verwarmingssysteem',
  warmTapwater: 'Warm tapwater',
  ventilatie: 'Ventilatie',
  verlichting: 'Verlichting',
  airconditioning: 'Airconditioning',
  zonwering: 'Zonwering',
  gebouwmanagement: 'Gebouwmanagement'
};

// Helper om foto's te laden als base64 met compressie en resizing
async function loadImageAsBase64(
  url: string, 
  maxWidth: number = 1200, 
  maxHeight: number = 1200,
  quality: number = 0.65
): Promise<{ data: string; width: number; height: number } | null> {
  return new Promise((resolve) => {
    try {
      // Als het een relatieve URL is, maak het absoluut
      const imageUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Bereken nieuwe afmetingen met behoud van aspect ratio
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (img.width > maxWidth || img.height > maxHeight) {
          const aspectRatio = img.width / img.height;
          if (img.width > img.height) {
            newWidth = Math.min(img.width, maxWidth);
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = Math.min(img.height, maxHeight);
            newWidth = newHeight * aspectRatio;
          }
        }
        
        // Maak een canvas om de image te converteren en comprimeren
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Gebruik image smoothing voor betere kwaliteit bij downscaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Compressie met lagere kwaliteit voor kleinere bestandsgrootte
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve({
            data: base64,
            width: newWidth,
            height: newHeight
          });
        } else {
          resolve(null);
        }
      };
      
      img.onerror = () => {
        // Fallback: probeer via fetch
        fetch(imageUrl)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              const img2 = new Image();
              img2.onload = () => {
                // Pas dezelfde compressie toe
                let newWidth = img2.width;
                let newHeight = img2.height;
                
                if (img2.width > maxWidth || img2.height > maxHeight) {
                  const aspectRatio = img2.width / img2.height;
                  if (img2.width > img2.height) {
                    newWidth = Math.min(img2.width, maxWidth);
                    newHeight = newWidth / aspectRatio;
                  } else {
                    newHeight = Math.min(img2.height, maxHeight);
                    newWidth = newHeight * aspectRatio;
                  }
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';
                  ctx.drawImage(img2, 0, 0, newWidth, newHeight);
                  const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                  resolve({
                    data: compressedBase64,
                    width: newWidth,
                    height: newHeight
                  });
                } else {
                  resolve(null);
                }
              };
              img2.onerror = () => resolve(null);
              img2.src = base64;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          })
          .catch(() => resolve(null));
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Fout bij laden foto:', error);
      resolve(null);
    }
  });
}

// Helper om tekst te wrappen
function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = doc.getTextWidth(testLine);
    
    if (testWidth > maxWidth && i > 0) {
      doc.text(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  doc.text(line, x, currentY);
  return currentY + lineHeight;
}

export async function generatePDF(
  buildingData: BuildingData,
  opnamenData: OpnamenData,
  sectionPhotos: SectionPhotos
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  // Pagina 1: Titelblad
  // Lichtgrijze achtergrond
  doc.setFillColor(245, 245, 245); // Lichtgrijs
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GACS Audit Rapport', pageWidth / 2, 60, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(buildingData.buildingName || 'Geen gebouwnaam', pageWidth / 2, 80, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(buildingData.address || 'Geen adres', pageWidth / 2, 95, { align: 'center' });
  
  // Gebouwfoto toevoegen als die er is
  if (buildingData.photo) {
    const photoData = await loadImageAsBase64(buildingData.photo);
    if (photoData) {
      try {
        const imgWidth = 80;
        const imgHeight = (photoData.height / photoData.width) * imgWidth;
        const imgX = (pageWidth - imgWidth) / 2;
        const imgY = 110;
        doc.addImage(photoData.data, 'JPEG', imgX, imgY, imgWidth, imgHeight);
      } catch (error) {
        console.error('Fout bij toevoegen gebouwfoto:', error);
      }
    }
  }
  
  // Gebouwgegevens
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  let yPos = 200;
  
  if (buildingData.buildingType) {
    doc.text(`Gebouwtype: ${buildingData.buildingType}`, margin, yPos);
    yPos += 7;
  }
  if (buildingData.energyLabel) {
    doc.text(`Energielabel: ${buildingData.energyLabel}`, margin, yPos);
    yPos += 7;
  }
  if (buildingData.date) {
    doc.text(`Datum opname: ${buildingData.date}`, margin, yPos);
    yPos += 7;
  }
  if (buildingData.contactPerson) {
    doc.text(`Contactpersoon: ${buildingData.contactPerson}`, margin, yPos);
  }

  // Pagina 2: GACS Wetgeving Samenvatting
  doc.addPage();
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('GACS Wetgeving Samenvatting', margin, 30);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  let y = 45;
  
  const gacsText = [
    'De GACS (Gebouwautomatisering en -regeling) wetgeving heeft als doel om het energieverbruik van gebouwen te verminderen door middel van intelligente regelsystemen.',
    '',
    'De wetgeving stelt minimale eisen aan verschillende onderdelen van gebouwautomatisering:',
    '',
    '• Verwarmingssysteem: Minimaal niveau C',
    '• Warm tapwater: Minimaal niveau C',
    '• Ventilatie: Minimaal niveau C',
    '• Verlichting: Minimaal niveau C',
    '• Airconditioning: Minimaal niveau C',
    '• Zonwering: Minimaal niveau C',
    '• Gebouwmanagement: Minimaal niveau B',
    '',
    'Elk niveau (A, B, C) vertegenwoordigt een bepaald niveau van automatisering en intelligentie in de regeling. Niveau A is het hoogste niveau met de meest geavanceerde regeling, gevolgd door niveau B en C.',
    '',
    'Dit rapport geeft een overzicht van de huidige status van de gebouwautomatisering en regeling voor het betreffende gebouw.'
  ];
  
  gacsText.forEach((line) => {
    if (line === '') {
      y += 5;
    } else {
      y = wrapText(doc, line, margin, y, contentWidth, 6);
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    }
  });

  // Pagina 3: Overzicht voldoen aan eisen
  doc.addPage();
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Overzicht Voldoen aan Eisen', margin, 30);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('De volgende tabel geeft een overzicht van welke onderdelen voldoen aan de minimale eisen:', margin, 45);
  
  // Tabel data voorbereiden
  const tableData: string[][] = [];
  const sections = [
    'verwarmingssysteem',
    'warmTapwater',
    'ventilatie',
    'verlichting',
    'airconditioning',
    'zonwering',
    'gebouwmanagement'
  ];
  
  sections.forEach((sectionKey) => {
    const sectionName = sectionNames[sectionKey] || sectionKey;
    const minLevel = sectionKey === 'gebouwmanagement' ? 'B' : 'C';
    const sectionData = opnamenData[sectionKey as keyof OpnamenData];
    
    // TODO: Later logica toevoegen om te bepalen of voldaan wordt aan minimaal niveau
    // Voor nu: "Nog te bepalen" als er data is, anders "Niet ingevuld"
    const status = sectionData ? 'Nog te bepalen' : 'Niet ingevuld';
    
    tableData.push([
      sectionName,
      `Minimaal niveau ${minLevel}`,
      status
    ]);
  });
  
  // Use autoTable function directly
  autoTable(doc, {
    startY: 55,
    head: [['Onderdeel', 'Minimaal niveau', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [52, 50, 52], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: margin, right: margin }
  });

  // Pagina's per onderdeel
  for (const sectionKey of sections) {
    const sectionData = opnamenData[sectionKey as keyof OpnamenData];
    if (!sectionData) continue;
    
    const sectionName = sectionNames[sectionKey] || sectionKey;
    const photos = sectionPhotos[sectionKey] || [];
    
    doc.addPage();
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(sectionName, margin, 30);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    let y = 45;
    
    // Antwoorden weergeven
    const answers: string[][] = [];
    Object.entries(sectionData).forEach(([key, value]) => {
      // Skip foto keys
      if (key.endsWith('_foto')) return;
      
      let displayValue = '';
      if (value === null || value === undefined) {
        displayValue = 'Niet ingevuld';
      } else if (typeof value === 'boolean') {
        displayValue = value ? 'Ja' : 'Nee';
      } else if (typeof value === 'number') {
        displayValue = value.toString();
      } else {
        displayValue = String(value);
      }
      
      // Vervang underscores en maak leesbaar
      const questionText = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      
      answers.push([questionText, displayValue]);
    });
    
    if (answers.length > 0) {
      // Use autoTable function directly
      autoTable(doc, {
        startY: y,
        head: [['Vraag', 'Antwoord']],
        body: answers,
        theme: 'striped',
        headStyles: { fillColor: [52, 50, 52], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 80 }
        }
      });
      
      const finalY = (doc as any).lastAutoTable.finalY || y + (answers.length * 8);
      y = finalY + 10;
    }
    
    // Foto's toevoegen
    if (photos.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Foto\'s:', margin, y);
      y += 10;
      
      for (const photo of photos) {
        if (y > pageHeight - 60) {
          doc.addPage();
          y = margin;
        }
        
        const photoData = await loadImageAsBase64(photo.bestandspad.replace(/^public\//, '/'));
        if (photoData) {
          try {
            const maxWidth = contentWidth;
            const maxHeight = 60;
            let imgWidth = photoData.width;
            let imgHeight = photoData.height;
            
            // Scale down if needed (convert pixels to mm, assuming 96 DPI)
            const pixelsToMm = 0.264583;
            imgWidth *= pixelsToMm;
            imgHeight *= pixelsToMm;
            
            const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
            imgWidth *= scale;
            imgHeight *= scale;
            
            const imgX = margin;
            doc.addImage(photoData.data, 'JPEG', imgX, y, imgWidth, imgHeight);
            
            if (photo.beschrijving) {
              doc.setFontSize(9);
              doc.setFont('helvetica', 'italic');
              doc.text(photo.beschrijving, margin, y + imgHeight + 5);
              y += imgHeight + 10;
            } else {
              y += imgHeight + 5;
            }
          } catch (error) {
            console.error('Fout bij toevoegen foto:', error);
            y += 10;
          }
        }
      }
    }
  }

  // Download PDF
  const fileName = `gacs-rapport-${buildingData.buildingName || 'opname'}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

