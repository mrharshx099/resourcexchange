import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../context/ThemeContext';

export default function ResourceMapView({
  resources = [],
  seekerLat = 40.7580,
  seekerLng = -73.9855,
  maxDistanceKm = 30,
  onSelectResource,
  onRequestResource
}) {
  const { isDark } = useTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circleLayerRef = useRef(null);

  // Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [seekerLat, seekerLng],
        zoom: 12,
        zoomControl: true,
      });

      markersLayerRef.current = L.layerGroup().addTo(map);
      circleLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when isDark changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tiles = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tiles;
  }, [isDark]);

  // Update Seeker Marker, Radius Circle, and Resource Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !circleLayerRef.current) return;

    // Clear previous layers
    markersLayerRef.current.clearLayers();
    circleLayerRef.current.clearLayers();

    // 1. Add Seeker's own location marker + proximity radius circle
    const seekerIcon = L.divIcon({
      className: 'custom-seeker-marker',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background: #10b981; border: 3px solid ${isDark ? '#0f172a' : '#ffffff'}; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const seekerMarker = L.marker([seekerLat, seekerLng], { icon: seekerIcon })
      .bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: ${isDark ? '#f8fafc' : '#0f172a'}; background: ${isDark ? '#0f172a' : '#ffffff'}; padding: 8px 10px; border-radius: 8px;">
          <strong style="color: #059669;">📍 Your Business Location</strong><br/>
          Midtown Manhattan Base<br/>
          <span style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#64748b'};">Proximity Search Radius: ${maxDistanceKm} km</span>
        </div>
      `);
    markersLayerRef.current.addLayer(seekerMarker);

    // Proximity search circle
    const radiusMeters = (Number(maxDistanceKm) || 20) * 1000;
    const searchCircle = L.circle([seekerLat, seekerLng], {
      radius: radiusMeters,
      color: '#10b981',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#10b981',
      fillOpacity: isDark ? 0.05 : 0.08,
    });
    circleLayerRef.current.addLayer(searchCircle);

    // 2. Add Resource Markers
    const bounds = L.latLngBounds([[seekerLat, seekerLng]]);

    resources.forEach((res) => {
      if (!res.lat || !res.lng) return;

      const score = res.matchScore || 85;
      let badgeBg = '#10b981'; // Emerald
      if (score < 75) badgeBg = '#0d9488'; // Teal
      if (score < 65) badgeBg = '#f59e0b'; // Amber

      const resourceIcon = L.divIcon({
        className: 'custom-resource-marker',
        html: `
          <div style="
            background: ${isDark ? '#0f172a' : '#ffffff'};
            border: 2px solid ${badgeBg};
            color: ${isDark ? '#ffffff' : '#0f172a'};
            border-radius: 12px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 4px 14px rgba(0,0,0,${isDark ? '0.5' : '0.15'});
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            cursor: pointer;
          ">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${badgeBg};"></span>
            <span>${score}%</span>
            <span style="font-weight: 600; font-size: 10px; opacity: 0.85;">$${res.price_per_day || res.price_per_hour * 8}</span>
          </div>
        `,
        iconSize: [60, 26],
        iconAnchor: [30, 13],
      });

      const marker = L.marker([res.lat, res.lng], { icon: resourceIcon });

      // Popup Content Card
      const popupBg = isDark ? '#0f172a' : '#ffffff';
      const textColor = isDark ? '#f8fafc' : '#0f172a';
      const subtextColor = isDark ? '#94a3b8' : '#64748b';
      const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';

      const popupHtml = `
        <div style="font-family: inherit; width: 230px; border-radius: 12px; overflow: hidden; background: ${popupBg}; color: ${textColor}; padding: 0; box-shadow: 0 10px 25px rgba(0,0,0,0.2); border: 1px solid ${borderColor};">
          <img src="${res.image_url}" alt="" style="width: 100%; height: 110px; object-fit: cover; display: block;" />
          <div style="padding: 10px 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; color: #059669; background: rgba(5, 150, 105, 0.12); padding: 2px 6px; border-radius: 6px;">
                ${res.category || res.type}
              </span>
              <span style="font-size: 11px; font-weight: 800; color: #d97706;">
                ${score}% Match
              </span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; color: ${textColor}; margin: 4px 0 2px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${res.title}
            </h4>
            <p style="font-size: 11px; color: ${subtextColor}; margin: 0 0 8px 0;">
              ${res.provider_name} • ${res.distanceKm ? res.distanceKm + ' km' : 'Nearby'}
            </p>
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 6px; border-top: 1px solid ${borderColor};">
              <span style="font-size: 14px; font-weight: 800; color: ${textColor};">
                $${res.price_per_day ? res.price_per_day : res.price_per_hour * 8}<span style="font-size: 10px; color: ${subtextColor}; font-weight: normal;">/day</span>
              </span>
              <button 
                id="popup-btn-${res.id}" 
                style="background: #10b981; color: #022c22; font-weight: 700; font-size: 11px; border: none; padding: 4px 10px; border-radius: 8px; cursor: pointer;"
              >
                View →
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260, className: 'custom-leaflet-popup' });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${res.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectResource) onSelectResource(res);
          };
        }
      });

      markersLayerRef.current.addLayer(marker);
      bounds.extend([res.lat, res.lng]);
    });

    // Fit map bounds to show seeker location and resources
    if (resources.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [resources, seekerLat, seekerLng, maxDistanceKm, onSelectResource, onRequestResource, isDark]);

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl glass-panel transition-colors">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 shadow-xl pointer-events-auto transition-colors">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-900 dark:text-white">Your Location ({maxDistanceKm}km radius)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-emerald-500" />
          <span>High Match (90%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-teal-500" />
          <span>Good Match (75%–89%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-amber-500" />
          <span>Moderate Match (&lt;75%)</span>
        </div>
      </div>
    </div>
  );
}
