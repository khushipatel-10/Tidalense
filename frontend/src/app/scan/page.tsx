'use client';

import { useState, useRef, useEffect } from 'react';
import CameraView from '@/components/camera/CameraView';
import { OpticalMetrics, processImage } from '@/lib/ai/opencv-processor';
import { ArrowLeft, Upload, Camera, AlertTriangle, ShieldCheck, AlertCircle, Info, ChevronDown, ChevronUp, Droplets } from 'lucide-react';
import Image from 'next/image';
import useOpenCV from '@/hooks/use-opencv';
import CyberGrid from '@/components/ui/CyberGrid';

type ScanMode = 'selection' | 'camera' | 'preview' | 'analyzing' | 'results';

export default function ScanPage() {
    const [mode, setMode] = useState<ScanMode>('selection');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<OpticalMetrics | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ensure OpenCV extends to this page for file upload processing
    const cvLoaded = useOpenCV();

    const handleCapture = (image: string, data: OpticalMetrics) => {
        setCapturedImage(image);
        setMetrics(data);
        setAnalysis(null);
        setMode('preview');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!cvLoaded) {
            alert("Analysis engine is initializing. Please try again in a moment.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image(); // Force browser Image
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const result = processImage(canvas);
                if (result) {
                    handleCapture(canvas.toDataURL('image/jpeg', 0.9), result.metrics);
                } else {
                    alert("Could not process image. Please try another.");
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const runExpertAnalysis = async () => {
        if (!capturedImage || !metrics) return;
        setMode('analyzing');

        const embeddings: number[] = [];
        let lat: number | undefined;
        let lon: number | undefined;

        // 1. Get Location (with timeout)
        try {
            if ('geolocation' in navigator) {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                lat = position.coords.latitude;
                lon = position.coords.longitude;
                console.log("Location captured:", lat, lon);
            }
        } catch (e) {
            console.warn("Location access denied or failed:", e);
        }

        try {
            const { analyzeScan } = await import('@/lib/api');
            const result = await analyzeScan(capturedImage, metrics, embeddings, lat, lon);
            setAnalysis(result);
            setMode('results');
        } catch (e) {
            console.error(e);
            setMode('preview'); // Go back on error
            alert("Analysis failed. See console.");
        }
    };

    const resetScan = () => {
        setCapturedImage(null);
        setMetrics(null);
        setAnalysis(null);
        setMode('selection');
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white pb-24 font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
            <CyberGrid />
            <div className="p-4 md:p-8 max-w-4xl mx-auto relative z-10">
                <header className="flex items-center justify-between mb-8">
                    {mode !== 'selection' && (
                        <button onClick={resetScan} className="p-2 -ml-2 text-cyan-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className="text-xl font-bold tracking-tight text-center flex-1 font-mono uppercase text-cyan-100/90">
                        {mode === 'selection' ? "Water Quality Assistant" :
                            mode === 'results' ? "Quality Assessment" : "Scanner"}
                    </h1>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                {/* MODE: SELECTION */}
                {mode === 'selection' && (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900/80 border border-cyan-500/20 p-8 text-center space-y-4 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            {/* Decorative corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50"></div>
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50"></div>

                            <div className="w-16 h-16 bg-cyan-500/10 rounded-none flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                                <ShieldCheck className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-white uppercase">Start New Scan</h2>
                            <p className="text-cyan-100/60 max-w-sm mx-auto font-mono text-sm">
                                Analyze environmental water bodies or check container safety using AI.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode('camera')}
                                className="group relative p-6 bg-slate-900/80 border border-slate-700 hover:border-cyan-500/50 transition-all text-left overflow-hidden hover:bg-slate-800/80 backdrop-blur-sm"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition text-cyan-500">
                                    <Camera className="w-24 h-24" />
                                </div>
                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="w-10 h-10 bg-slate-800 rounded-none flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition border border-slate-700 group-hover:border-cyan-500/30">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors uppercase font-mono">Use Camera</h3>
                                        <p className="text-sm text-slate-400 group-hover:text-slate-300">Take a photo directly</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative p-6 bg-slate-900/80 border border-slate-700 hover:border-cyan-500/50 transition-all text-left overflow-hidden hover:bg-slate-800/80 backdrop-blur-sm"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition text-cyan-500">
                                    <Upload className="w-24 h-24" />
                                </div>
                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="w-10 h-10 bg-slate-800 rounded-none flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition border border-slate-700 group-hover:border-cyan-500/30">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors uppercase font-mono">Upload File</h3>
                                        <p className="text-sm text-slate-400 group-hover:text-slate-300">Select from gallery</p>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </button>
                        </div>
                    </div>
                )}

                {/* MODE: CAMERA */}
                {mode === 'camera' && (
                    <div className="animate-in fade-in">
                        <CameraView onCapture={handleCapture} />
                    </div>
                )}

                {/* MODE: PREVIEW & ANALYZING */}
                {(mode === 'preview' || mode === 'analyzing') && capturedImage && (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in">
                        <div className="relative w-full aspect-[3/4] max-w-sm rounded-none overflow-hidden border border-cyan-500/30 shadow-2xl bg-black">
                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500 z-20"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500 z-20"></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500 z-20"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500 z-20"></div>

                            <Image src={capturedImage} alt="Preview" fill className="object-cover opacity-80" />
                            {mode === 'analyzing' && (
                                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-cyan-300 font-mono font-bold animate-pulse uppercase tracking-widest">Analyzing Structure...</p>
                                </div>
                            )}
                        </div>

                        {mode === 'preview' && (
                            <div className="w-full max-w-sm grid grid-cols-2 gap-3">
                                <button onClick={resetScan} className="py-3 rounded-none border border-slate-600 hover:bg-slate-800 transition font-bold text-sm uppercase tracking-wider text-slate-300">
                                    Retake
                                </button>
                                <button
                                    onClick={runExpertAnalysis}
                                    className="py-3 rounded-none bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] uppercase tracking-wider transition-all"
                                >
                                    Analyze Risk
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* MODE: RESULTS */}
                {mode === 'results' && analysis && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                        {/* 1. SEVERITY GAUGE */}
                        <div className="bg-slate-900/90 border border-slate-700 rounded-none p-6 relative overflow-hidden backdrop-blur-md">
                            <div className={`absolute top-0 left-0 w-full h-1
                                ${analysis.risk_level === 'Low' || analysis.risk_level === 'Safe' ? 'bg-green-500' :
                                    analysis.risk_level === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'}`}
                            />

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-cyan-500 text-xs uppercase tracking-widest font-bold mb-1 font-mono">Total Risk Score</h2>
                                    <div className="text-5xl font-black tracking-tighter flex items-baseline gap-2 text-white">
                                        {analysis.risk_score}
                                        <span className="text-lg font-normal text-slate-500 font-mono">/100</span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border
                                    ${analysis.risk_level === 'Low' || analysis.risk_level === 'Safe' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        analysis.risk_level === 'Moderate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                    {analysis.gemini_analysis.severity_level || analysis.risk_level}
                                </div>
                            </div>

                            {/* Gauge Visual */}
                            <div className="w-full bg-slate-800 h-4 rounded-none overflow-hidden mb-2 border border-slate-700">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out
                                    ${analysis.risk_score < 30 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                                            analysis.risk_score < 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
                                    style={{ width: `${analysis.risk_score}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 font-mono">
                                <span>SAFE</span>
                                <span>MODERATE</span>
                                <span>CRITICAL</span>
                            </div>
                        </div>

                        {/* 1.5. REAL-TIME DATA (USGS) */}
                        {analysis.external_data && (
                            <div className="bg-cyan-950/20 border border-cyan-500/20 p-6 backdrop-blur-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <ShieldCheck className="w-12 h-12 text-cyan-400" />
                                </div>
                                <h3 className="font-bold text-cyan-400 uppercase font-mono mb-1 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-cyan-400 animate-pulse rounded-full"></span>
                                    Live Station Data
                                </h3>
                                <p className="text-xs text-slate-500 mb-4 font-mono">
                                    Source: {analysis.external_data.source} | Station: {analysis.external_data.station_name}
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(analysis.external_data.parameters).map(([key, val]) => (
                                        <div key={key} className="bg-slate-900/50 p-2 border border-cyan-500/10">
                                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">{key}</span>
                                            <span className="font-mono text-white text-sm font-bold">{String(val)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 1.5b HELPER: Algae Bloom Forecast */}
                        {/* Only show if NOT a container AND user has algae data */}
                        {analysis.algae_analysis &&
                            analysis.gemini_analysis.mode_detected !== 'Container/Product' &&
                            (analysis.algae_analysis.risk_score > 10 || analysis.algae_analysis.drivers.length > 0) && (
                                <div className={`border p-6 backdrop-blur-md relative overflow-hidden
                                ${analysis.algae_analysis.risk_level === 'Critical' ? 'bg-red-950/30 border-red-500/30' :
                                        analysis.algae_analysis.risk_level === 'High' ? 'bg-orange-950/30 border-orange-500/30' :
                                            'bg-green-950/20 border-green-500/20'}`}>

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className={`font-bold uppercase font-mono mb-1 flex items-center gap-2
                                            ${analysis.algae_analysis.risk_level === 'Critical' ? 'text-red-400' :
                                                    analysis.algae_analysis.risk_level === 'High' ? 'text-orange-400' : 'text-green-400'}`}>
                                                <Droplets className="w-4 h-4" />
                                                Algae Bloom Forecast
                                            </h3>
                                            <div className="text-2xl font-black text-white">
                                                {analysis.algae_analysis.risk_level} Risk
                                            </div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border
                                        ${analysis.algae_analysis.risk_level === 'Critical' ? 'bg-red-500/20 border-red-500 text-red-500' :
                                                analysis.algae_analysis.risk_level === 'High' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-green-500/20 border-green-500 text-green-500'}`}>
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-300 mb-3 italic">
                                        "{analysis.algae_analysis.action}"
                                    </p>

                                    {analysis.algae_analysis.drivers.length > 0 && (
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Key Drivers</span>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.algae_analysis.drivers.map((driver: string, i: number) => (
                                                    <span key={i} className="text-xs bg-black/40 px-2 py-1 rounded border border-white/10 text-slate-200">
                                                        {driver}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* 1.6. BRAND ANALYSIS */}
                        {analysis.gemini_analysis.brand_analysis?.detected && (
                            <div className="bg-blue-950/20 border border-blue-500/20 p-6 backdrop-blur-md">
                                <h3 className="font-bold text-blue-400 uppercase font-mono mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Brand Safety Check
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b border-blue-500/10 pb-2">
                                        <span className="text-slate-400 text-sm">Detected Brand</span>
                                        <span className="font-bold text-white font-mono">{analysis.gemini_analysis.brand_analysis.brand_name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-blue-500/10 pb-2">
                                        <span className="text-slate-400 text-sm">Reputation</span>
                                        <span className={`font-bold font-mono px-2 py-0.5 text-xs uppercase
                                            ${analysis.gemini_analysis.brand_analysis.reputation === 'Safe' ? 'bg-green-500/20 text-green-400' :
                                                analysis.gemini_analysis.brand_analysis.reputation === 'Caution' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>
                                            {analysis.gemini_analysis.brand_analysis.reputation}
                                        </span>
                                    </div>
                                    <p className="text-xs text-blue-200/60 pt-2 leading-relaxed font-mono">
                                        &gt; {analysis.gemini_analysis.brand_analysis.recall_info}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 2. SUMMARY & DETAILS */}
                        <div className="bg-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-md">
                            <div className="flex items-start gap-3 mb-4">
                                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1 text-white uppercase font-mono">Analysis Summary</h3>
                                    <p className="text-slate-300 leading-relaxed text-sm">
                                        {analysis.gemini_analysis.reasoning}
                                    </p>
                                </div>
                            </div>

                            {analysis.gemini_analysis.details && (
                                <div className="pl-8 text-xs text-slate-500 font-mono border-l border-slate-700">
                                    {analysis.gemini_analysis.details}
                                </div>
                            )}
                        </div>

                        {/* 3. BREAKDOWN CHART */}
                        {analysis.gemini_analysis.score_breakdown && analysis.gemini_analysis.score_breakdown.length > 0 && (
                            <div className="bg-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-md">
                                <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-4 font-mono">Risk Factors</h3>
                                <div className="space-y-4">
                                    {analysis.gemini_analysis.score_breakdown.map((item: any, idx: number) => (
                                        <div key={idx} className="group">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-slate-200">{item.factor}</span>
                                                <span className="font-mono text-cyan-400">{item.score}/100</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-1.5 rounded-none overflow-hidden mb-1">
                                                <div
                                                    className="h-full bg-cyan-500/60 group-hover:bg-cyan-400 transition-all"
                                                    style={{ width: `${item.score}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500">{item.contribution}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. POTENTIAL HARMS */}
                        {analysis.gemini_analysis.potential_harms && analysis.gemini_analysis.potential_harms.length > 0 && (
                            <div className="bg-red-950/20 border border-red-500/20 p-6 backdrop-blur-md">
                                <div className="flex items-center gap-2 mb-4 text-red-400">
                                    <AlertTriangle className="w-5 h-5" />
                                    <h3 className="font-bold uppercase font-mono">Potential Harms</h3>
                                </div>
                                <ul className="space-y-2">
                                    {analysis.gemini_analysis.potential_harms.map((harm: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-red-200/80">
                                            <span className="block w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                                            {harm}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 5. RECOMMENDATIONS */}
                        {analysis.gemini_analysis.recommendations && analysis.gemini_analysis.recommendations.length > 0 && (
                            <div className="bg-green-950/20 border border-green-500/20 p-6 backdrop-blur-md">
                                <div className="flex items-center gap-2 mb-4 text-green-400">
                                    <ShieldCheck className="w-5 h-5" />
                                    <h3 className="font-bold uppercase font-mono">Recommendations</h3>
                                </div>
                                <ul className="space-y-2">
                                    {analysis.gemini_analysis.recommendations.map((rec: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-green-200/80">
                                            <span className="block w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={resetScan}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500/50 text-white font-bold transition flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                            <Camera className="w-5 h-5" />
                            Start New Scan
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
