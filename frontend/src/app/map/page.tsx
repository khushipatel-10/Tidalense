'use client';

import { useState, useRef, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, Layer, Source, FillLayer, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';
import { ShieldAlert, MapPin, Info, Navigation, Droplets, ArrowLeft } from 'lucide-react';

// Mock Data for Demo (unchanged)
const MOCK_RISK_POINTS = [
    { id: 1, lat: 29.3013, lon: -94.7977, score: 85, city: "Galveston, TX", note: "High turbidity near industrial outflow" },
    { id: 2, lat: 29.3240, lon: -94.7800, score: 45, city: "Galveston, TX", note: "Clear water, low edge density" },
    { id: 3, lat: 29.7604, lon: -95.3698, score: 72, city: "Houston, TX", note: "Urban runoff accumulation" },
    { id: 4, lat: 29.5604, lon: -95.1698, score: 60, city: "Clear Lake, TX", note: "Suspended sediment visible" },
];

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVtb2NoYXAiLCJhIjoiY2t5Z3h6ZWY5MDB4ODJ2b3JtZmYyYm1iNyJ9.Ze2Z_w9b2e08_999999999';

// Cyan Water Layer Style
const waterLayer: FillLayer = {
    id: 'water-layer',
    type: 'fill',
    paint: {
        'fill-color': '#06b6d4', // Cyan-500
        'fill-opacity': 0.3
    }
};

export default function MapPage() {
    const [popupInfo, setPopupInfo] = useState<any>(null);
    const [viewState, setViewState] = useState({
        longitude: -94.7977,
        latitude: 29.3013,
        zoom: 9
    });
    const mapRef = useRef<MapRef>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const EXAMPLE_LOCATIONS = [
        {
            name: "Galveston Bay",
            lat: 29.5,
            lon: -94.75,
            score: 85,
            status: "Critical",
            note: "Heavy industrial runoff and high turbidity detected.",
            pollutants: ["Oil Residue", "Chemical Runoff"]
        },
        {
            name: "Lake Houston",
            lat: 29.93,
            lon: -95.13,
            score: 30,
            status: "Safe",
            note: "Water clarity is high. Minimal algal growth.",
            pollutants: ["None detection"]
        },
        {
            name: "Buffalo Bayou",
            lat: 29.76,
            lon: -95.37,
            score: 72,
            status: "High",
            note: "Urban runoff and sediment suspension visible.",
            pollutants: ["Sediment", "Urban Debris"]
        },
        {
            name: "Mississippi River Delta",
            lat: 29.15,
            lon: -89.25,
            score: 92,
            status: "Critical",
            note: "Extremely high turbidity and likely fertilizer runoff.",
            pollutants: ["Nitrates", "Algal Bloom", "Sediment"]
        },
    ];

    const handleLocationSelect = (loc: any) => {
        mapRef.current?.flyTo({
            center: [loc.lon, loc.lat],
            zoom: 11,
            duration: 2000
        });

        setPopupInfo({
            lon: loc.lon,
            lat: loc.lat,
            name: loc.name,
            score: loc.score,
            status: loc.status,
            note: loc.note,
            pollutants: loc.pollutants,
            isWaterBody: false // It's a specific point/bookmark
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Searching for:", searchQuery);

        const term = searchQuery.toLowerCase();
        const match = EXAMPLE_LOCATIONS.find(l => l.name.toLowerCase().includes(term));

        if (match) {
            handleLocationSelect(match);
        } else if (term.includes("galveston")) {
            handleLocationSelect(EXAMPLE_LOCATIONS[0]);
        } else if (term.includes("houston")) {
            handleLocationSelect(EXAMPLE_LOCATIONS[2]); // Default to Bayou for Houston
        } else {
            alert("Location not found in demo dataset.");
        }
    };

    // Geolocation Handler
    const handleLocateMe = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                mapRef.current?.flyTo({
                    center: [position.coords.longitude, position.coords.latitude],
                    zoom: 12,
                    duration: 2000
                });
            }, (error) => {
                console.error("Geolocation error:", error);
                alert("Could not access location. Please enable permissions.");
            });
        }
    };

    // Deterministic Mock Data Generator for Water Bodies
    const generateWaterData = (name: string) => {
        // Simple hash to get consistent number from string
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        const score = Math.abs(hash % 100); // 0-99
        const isHighRisk = score > 60;

        return {
            name: name,
            score: score,
            pollutants: isHighRisk ? ["Microbeads", "Fibers"] : ["Low Particulate"],
            note: isHighRisk ? "Detected high turbidity accumulation." : "Water appears optically clear.",
            status: score < 30 ? "Safe" : score < 60 ? "Moderate" : "Critical"
        };
    };

    const handleMapClick = async (event: any) => {
        const features = event.features;
        if (features && features.length > 0) {
            const waterFeature = features.find((f: any) => f.layer.id === 'water-layer' || f.layer.id.includes('water'));

            if (waterFeature) {
                // Show loading state initially
                setPopupInfo({
                    lon: event.lngLat.lng,
                    lat: event.lngLat.lat,
                    name: "Loading...",
                    score: 0,
                    status: "Loading",
                    note: "Fetching water body data...",
                    pollutants: [],
                    isWaterBody: true,
                    isLoading: true
                });

                // Try to get name from properties, if not avail, fetch from API
                let waterName = waterFeature.properties?.name;

                if (!waterName) {
                    try {
                        const response = await fetch(
                            `https://api.mapbox.com/geocoding/v5/mapbox.places/${event.lngLat.lng},${event.lngLat.lat}.json?access_token=${MAPBOX_TOKEN}`
                        );
                        const data = await response.json();
                        console.log("Mapbox Geocoding Response:", data);

                        // Look for relevant features
                        const relevantFeature = data.features?.find((f: any) =>
                            f.place_type.includes('waterway') ||
                            f.place_type.includes('natural_feature') ||
                            f.place_type.includes('place') ||
                            f.place_type.includes('poi')
                        );
                        console.log("Relevant Feature Found:", relevantFeature);

                        if (relevantFeature) {
                            waterName = relevantFeature.text;
                        }
                    } catch (error) {
                        console.error("Failed to fetch water name:", error);
                    }
                }

                // Fallback if still no name
                waterName = waterName || "Unnamed Water Body";

                const data = generateWaterData(waterName);

                setPopupInfo({
                    lon: event.lngLat.lng,
                    lat: event.lngLat.lat,
                    ...data,
                    isWaterBody: true,
                    isLoading: false
                });
            } else {
                setPopupInfo(null);
            }
        } else {
            setPopupInfo(null);
        }
    };

    return (
        <main className="flex h-screen w-full bg-slate-950 text-white pt-16 font-sans">
            {/* SIDEBAR */}
            <aside className="w-80 h-full bg-slate-900 border-r border-cyan-900/50 flex flex-col z-20 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/90 -z-10"></div>

                <div className="p-6 border-b border-cyan-500/20 relative z-10">
                    <h1 className="text-lg font-black flex items-center gap-2 mb-1 uppercase tracking-tight text-white">
                        <MapPin className="text-cyan-400 w-5 h-5" />
                        Water Quality Map
                    </h1>
                    <p className="text-cyan-100/60 text-xs font-mono">
                        Global Contamination Monitoring
                    </p>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-6 relative z-10">
                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest font-mono">Search Sector</label>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search city, river, or bay..."
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-none py-2 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-mono"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors">
                                <MapPin className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    {/* Current Location */}
                    <div>
                        <button
                            onClick={handleLocateMe}
                            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500/50 text-white py-2 px-4 rounded-none text-sm font-bold uppercase tracking-wide transition-all"
                        >
                            <Navigation className="w-4 h-4 text-cyan-400" />
                            Locate Me
                        </button>
                    </div>

                    {/* Example Locations */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest font-mono">Priority Targets</label>
                        <div className="flex flex-col gap-2">
                            {EXAMPLE_LOCATIONS.map((loc) => (
                                <button
                                    key={loc.name}
                                    onClick={() => handleLocationSelect(loc)}
                                    className="text-left p-3 rounded-none border border-slate-800 bg-slate-950/30 hover:bg-cyan-950/20 hover:border-cyan-500/30 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-sm text-slate-200 group-hover:text-cyan-100 font-mono">{loc.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-none font-bold uppercase ${loc.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                            loc.status === 'High' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-green-500/20 text-green-400'
                                            }`}>
                                            {loc.score}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-slate-400">
                                        <div className={`w-1.5 h-1.5 rounded-full ${loc.status === 'Critical' ? 'bg-red-500 animate-pulse' :
                                            loc.status === 'High' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}></div>
                                        {loc.status} Risk Level
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-cyan-900/30 text-[10px] text-slate-500 text-center font-mono uppercase relative z-10 bg-slate-900/80">
                    [SYSTEM] Data Stream: LIVE
                </div>
            </aside>

            {/* MAP CONTAINER */}
            <div className="flex-1 w-full h-full relative z-10">
                <Link href="/" className="absolute top-4 left-4 z-30 p-2 bg-black/60 text-white hover:text-cyan-400 border border-white/10 backdrop-blur-md transition-colors rounded-none">
                    <ArrowLeft className="w-6 h-6" />
                </Link>

                <Map
                    ref={mapRef}
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    interactiveLayerIds={['water-layer']} // Make our custom layer interactive
                    onClick={handleMapClick}
                >
                    <NavigationControl position="bottom-right" />

                    {/* 1. CUSTOM WATER LAYER */}
                    {/* We overlay a blue fill on top of the map's water source */}
                    <Source id="water-source" type="vector" url="mapbox://mapbox.mapbox-streets-v8">
                        <Layer
                            {...waterLayer}
                            source-layer="water"
                            beforeId="bridge-simple" // Try to place it under bridges/labels if possible
                        />
                    </Source>

                    {/* 2. RISK MARKERS */}
                    {MOCK_RISK_POINTS.map((point) => (
                        <Marker
                            key={point.id}
                            longitude={point.lon}
                            latitude={point.lat}
                            anchor="bottom"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setPopupInfo({ ...point, isWaterBody: false });
                            }}
                        >
                            <div
                                className={`w-6 h-6 rounded-none border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-pointer transform hover:scale-125 transition-transform flex items-center justify-center rotate-45
                  ${point.score > 70 ? 'bg-red-500' : point.score > 40 ? 'bg-yellow-500' : 'bg-cyan-500'}
                `}
                            >
                                {point.score > 70 && <ShieldAlert className="w-3 h-3 text-white -rotate-45" />}
                            </div>
                        </Marker>
                    ))}

                    {/* 3. POPUPS */}
                    {popupInfo && (
                        <Popup
                            anchor="top"
                            longitude={popupInfo.lon}
                            latitude={popupInfo.lat}
                            onClose={() => setPopupInfo(null)}
                            className="text-black z-50 text-left"
                            closeButton={true}
                            closeOnClick={false}
                        >
                            <div className="p-3 min-w-[220px]">
                                <div className="flex justify-between items-start mb-2 border-b border-zinc-200 pb-2">
                                    <h3 className="font-bold text-base flex items-center gap-1.5 uppercase font-mono">
                                        {popupInfo.isWaterBody && <Droplets className="w-4 h-4 text-cyan-600" />}
                                        {popupInfo.name || popupInfo.city}
                                    </h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-none font-bold text-white uppercase tracking-wider
                       ${popupInfo.score > 70 ? 'bg-red-500' : popupInfo.score > 40 ? 'bg-yellow-500' : 'bg-cyan-500'}
                    `}>
                                        {popupInfo.status || (popupInfo.score > 90 ? 'Critical' : popupInfo.score > 50 ? 'High' : 'Safe')}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-zinc-500 font-mono text-xs uppercase">Risk Score</span>
                                        <span className={`font-mono font-bold ${popupInfo.score > 60 ? 'text-red-600' : 'text-cyan-600'}`}>
                                            {popupInfo.score}/100
                                        </span>
                                    </div>

                                    <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-2 border border-zinc-200">
                                        {popupInfo.note}
                                    </p>

                                    {popupInfo.pollutants && (
                                        <div className="flex gap-1 flex-wrap">
                                            {popupInfo.pollutants.map((p: string) => (
                                                <span key={p} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 border border-red-100 uppercase tracking-tight">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1 justify-center font-mono">
                                    <Info className="w-3 h-3" />
                                    {popupInfo.isWaterBody ? 'Hydraulic Model Est.' : 'Optical Scan Data'}
                                </div>

                                <Link
                                    href={`/map/details?name=${encodeURIComponent(popupInfo.name || '')}&score=${popupInfo.score}&status=${popupInfo.status}&note=${encodeURIComponent(popupInfo.note || '')}`}
                                    className="block mt-3 w-full text-center bg-cyan-600 hover:bg-cyan-700 text-white text-xs py-2 font-bold uppercase tracking-wider transition-colors"
                                >
                                    View Detailed Analysis
                                </Link>
                            </div>
                        </Popup>
                    )}
                </Map>

                {/* Token Warning */}
                {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
                    <div className="absolute bottom-10 left-4 bg-red-900/80 text-white p-2 text-xs border border-red-500 backdrop-blur font-mono">
                        WARNING: Mapbox Token Missing.
                    </div>
                )}
            </div>
        </main>
    );
}
