'use client';

import { useEffect, useRef, useState } from 'react';
import type * as L from 'leaflet';

interface MapComponentProps {
  height?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export default function MapComponent({ height = "h-64", latitude, longitude, address }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    // Dynamically import Leaflet only on client side
    import('leaflet').then((L) => {
      // Fix voor default markers in Leaflet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Bepaal centrum en zoom level
      let centerLat = 52.3498237; // Amsterdam centrum
      let centerLon = 4.8466929;
      let zoom = 12;

      // Als GPS coördinaten beschikbaar zijn, gebruik die
      if (latitude && longitude) {
        centerLat = latitude;
        centerLon = longitude;
        zoom = 15; // Zoom in op specifieke locatie
      }

      // Maak kaart instance
      if (!mapRef.current) return;
      const map = L.map(mapRef.current).setView([centerLat, centerLon], zoom);

      // Voeg OpenStreetMap tiles toe (grijstinten)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        className: 'map-grayscale',
      }).addTo(map);

      // Voeg marker toe
      if (latitude && longitude) {
        // Marker voor geselecteerd adres
        const marker = L.marker([latitude, longitude]).addTo(map);
        
        // Voeg popup toe met adres informatie
        if (address) {
          marker.bindPopup(`
            <div style="text-align: center;">
              <strong>Geselecteerd Adres</strong><br/>
              ${address}<br/>
              <small>Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}</small>
            </div>
          `);
        }
      } else {
        // Default marker op Amsterdam centrum als geen GPS coördinaten beschikbaar zijn
        const defaultMarker = L.marker([centerLat, centerLon]).addTo(map);
        defaultMarker.bindPopup(`
          <div style="text-align: center;">
            <strong>Standaard Locatie</strong><br/>
            Amsterdam Centrum<br/>
            <small>Lat: ${centerLat.toFixed(6)}, Lng: ${centerLon.toFixed(6)}</small>
          </div>
        `);
      }

      mapInstanceRef.current = map;
    });

    // Cleanup functie
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, latitude, longitude, address]);

  // Show loading state during SSR and initial client render
  if (!isClient) {
    return (
      <div 
        className={`w-full ${height} rounded-lg bg-gray-100 flex items-center justify-center`}
        style={{ minHeight: '200px' }}
      >
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
          <p className="text-sm">Kaart wordt geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full ${height} rounded-lg`}
      style={{ minHeight: '200px' }}
    />
  );
}