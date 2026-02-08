'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Thermometer, Wind, AlertTriangle, TrendingUp, Waves, Factory, Building2, Droplets } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Link from 'next/link';
import { Suspense, useState } from 'react';

// Mock Data Generators
// Deterministic Pseudo-Random Number Generator
const seededRandom = (seed: number) => {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));
    return function () {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
};

const getHashFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
};

// Generate Dynamic Data based on Name & Score
const generateDynamicDetails = (name: string, score: number) => {
    const seed = getHashFromName(name);
    const rng = seededRandom(seed);

    // 1. Risk Factors
    const turbidity = Math.floor(score * 0.8 + (rng() * 20)); // Turbidity correlates with score
    const chemical = Math.floor(score * 0.6 + (rng() * 30));
    const debris = score > 60 ? "High" : score > 30 ? "Moderate" : "Low";

    const riskFactors = [
        { name: "Turbidity (Sediment)", level: turbidity > 70 ? "High" : "Moderate", pct: turbidity, color: "bg-orange-400" },
        { name: "Chemical Anomalies", level: chemical > 60 ? "High" : "Low", pct: chemical, color: "bg-yellow-400" },
        { name: "Surface Debris", level: debris, pct: debris === "High" ? 90 : debris === "Moderate" ? 50 : 10, color: "bg-red-400" }
    ];

    // 2. Environmental Context
    const temp = (15 + rng() * 15).toFixed(1); // 15-30C
    const aqi = Math.floor(20 + rng() * 50); // 20-70
    const flow = rng() > 0.5 ? "Low Flow" : "Moderate Flow";

    // 3. Trend Data
    const generateTrend = (count: number, period: string) => {
        const data = [];
        let current = score;
        for (let i = 0; i < count; i++) {
            const variance = Math.floor(rng() * 11) - 5;
            current = Math.max(0, Math.min(100, current + variance));
            data.push({ name: `${period} ${i + 1}`, score: current });
        }
        return data.reverse();
    };

    // 4. Algae Risk (Simulated)
    const algaeScore = Math.floor(score * 0.7 + (rng() * 30));
    const algaeLevel = algaeScore > 60 ? "Critical" : algaeScore > 40 ? "High" : algaeScore > 20 ? "Moderate" : "Low";
    const algaeDrivers = [];
    if (temp > 24) algaeDrivers.push(`High Water Temp (${temp}°C)`);
    if (turbidity > 60) algaeDrivers.push("High Turbidity");
    if (algaeScore > 40 && algaeDrivers.length === 0) algaeDrivers.push("Nutrient Load");

    return {
        riskFactors,
        env: { temp, aqi, flow },
        algae: { level: algaeLevel, score: algaeScore, drivers: algaeDrivers },
        generateTrend
    };
};

function DetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [timeRange, setTimeRange] = useState('Last 6 Months');

    const name = searchParams.get('name') || 'Unknown Location';
    const score = parseInt(searchParams.get('score') || '0');
    const status = searchParams.get('status') || 'Unknown';
    const note = searchParams.get('note') || 'No additional details available.';

    // Generate Dynamic Data
    const details = generateDynamicDetails(name, score);

    let trendData = [];
    if (timeRange === 'Last Month') trendData = details.generateTrend(30, 'Day');
    else if (timeRange === 'Last 6 Months') trendData = details.generateTrend(6, 'Month');
    else if (timeRange === 'Last Year') trendData = details.generateTrend(12, 'Month');
    else trendData = details.generateTrend(3, 'Year');

    // Colors
    const scoreColor = score > 70 ? 'text-red-500' : score > 40 ? 'text-yellow-500' : 'text-green-500';
    const chartColor = score > 70 ? '#ef4444' : score > 40 ? '#eab308' : '#22c55e';
    const bgGradient = score > 70 ? 'from-red-950/30' : score > 40 ? 'from-yellow-950/30' : 'from-green-950/30';

    return (
        <main className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 pb-20 overflow-x-hidden">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header & Back */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">{name}</h1>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${score > 70 ? 'border-red-500/50 bg-red-500/10 text-red-500' :
                                score > 40 ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' :
                                    'border-green-500/50 bg-green-500/10 text-green-500'
                                }`}>
                                {status} Risk
                            </span>
                            <span>•</span>
                            <span>Analysis Report</span>
                        </div>
                    </div>
                </div>

                {/* Score Overview */}
                <section className={`rounded-2xl border border-zinc-800 bg-gradient-to-b ${bgGradient} to-zinc-900/50 p-6 md:p-10 relative overflow-hidden`}>
                    <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                        <div>
                            <h2 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-2">Water Quality Risk Score</h2>
                            <div className={`text-6xl md:text-8xl font-black ${scoreColor} mb-4`}>
                                {score}<span className="text-2xl md:text-4xl text-zinc-600">/100</span>
                            </div>
                            <p className="text-zinc-300 leading-relaxed text-lg">
                                {note}
                            </p>
                        </div>
                        <div className="space-y-4 bg-black/20 p-6 rounded-xl border border-white/5">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                Primary Risk Factors
                            </h3>
                            <ul className="space-y-3">
                                {details.riskFactors.map((factor, i) => (
                                    <div key={i}>
                                        <li className="flex justify-between items-center text-sm mb-1">
                                            <span className="text-zinc-400">{factor.name}</span>
                                            <span className="font-mono text-white">{factor.level} ({factor.pct}%)</span>
                                        </li>
                                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                            <div className={`${factor.color} h-full`} style={{ width: `${factor.pct}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Environmental Context */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Thermometer className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-zinc-200">Water Temp</h3>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{details.env.temp}°C</div>
                        <p className="text-xs text-zinc-500">Live sensor reading.</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Wind className="w-5 h-5 text-green-400" />
                            </div>
                            <h3 className="font-semibold text-zinc-200">Air Quality (AQI)</h3>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{details.env.aqi}</div>
                        <p className="text-xs text-zinc-500">Local station data.</p>
                    </div>

                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Waves className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-zinc-200">Flow Rate</h3>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{details.env.flow}</div>
                    <p className="text-xs text-zinc-500">Volumetric flow estimation.</p>
                </div>
            </div>

            {/* Algae Bloom Forecast (Dynamic) */}
            {(details.algae.score > 20) && (
                <div className={`rounded-xl border p-6 relative overflow-hidden
                        ${details.algae.level === 'Critical' ? 'bg-red-950/20 border-red-500/20' :
                        details.algae.level === 'High' ? 'bg-orange-950/20 border-orange-500/20' :
                            'bg-green-950/10 border-green-500/10'}`}>

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className={`font-bold uppercase font-mono mb-1 flex items-center gap-2
                                    ${details.algae.level === 'Critical' ? 'text-red-400' :
                                    details.algae.level === 'High' ? 'text-orange-400' : 'text-green-400'}`}>
                                <Droplets className="w-4 h-4" />
                                Harmful Algal Bloom (HAB) Forecast
                            </h3>
                            <div className="text-2xl font-black text-white">
                                {details.algae.level} Risk
                            </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border
                                ${details.algae.level === 'Critical' ? 'bg-red-500/20 border-red-500 text-red-500' :
                                details.algae.level === 'High' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-green-500/20 border-green-500 text-green-500'}`}>
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Key Drivers</span>
                        <div className="flex flex-wrap gap-2">
                            {details.algae.drivers.length > 0 ? details.algae.drivers.map((driver, i) => (
                                <span key={i} className="text-xs bg-black/40 px-2 py-1 rounded border border-white/10 text-zinc-300">
                                    {driver}
                                </span>
                            )) : (
                                <span className="text-xs text-zinc-500">No significant drivers detected.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Trends Graph */}
            <section className="bg-zinc-900 ring-1 ring-zinc-800 rounded-xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            {timeRange} Risk Trend
                        </h3>
                        <p className="text-sm text-zinc-400">Historical analysis.</p>
                    </div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-zinc-700"
                    >
                        <option>Last Month</option>
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                        <option>Last 3 Years</option>
                    </select>
                </div>

                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="scoreHighlight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#52525b"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#52525b"
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke={chartColor}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#scoreHighlight)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Dynamic Sources (Simplified for Demo) */}
            <section className="grid md:grid-cols-2 gap-8 pt-4">
                <div>
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Factory className="w-5 h-5 text-zinc-400" />
                        Potential Contamination Sources
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                        Analysis suggests the following likely contributors:
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                            <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                            <div>
                                <span className="block text-sm font-medium text-white">
                                    {score > 60 ? "Industrial Effluent" : "Agricultural Runoff"}
                                </span>
                                <span className="text-xs text-zinc-500">
                                    {score > 60 ? "Proximity to industrial zones." : "Fertilizer and sediment runoff."}
                                </span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                            <div className="mt-1 w-2 h-2 rounded-full bg-yellow-500 shrink-0"></div>
                            <div>
                                <span className="block text-sm font-medium text-white">Urban Runoff</span>
                                <span className="text-xs text-zinc-500">General urban debris and tire wear particles.</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-zinc-400" />
                        Community Impact
                    </h4>
                    <div className="bg-blue-900/10 border border-blue-900/30 p-6 rounded-xl">
                        <p className="text-blue-100 text-sm leading-relaxed mb-4">
                            {score > 60 ?
                                "High contamination levels pose risks to local wildlife and potentially groundwater. Remediation is recommended." :
                                "Water quality is generally acceptable but requires ongoing monitoring to prevent degradation."
                            }
                        </p>
                        <div className="flex gap-3">
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-xs font-semibold transition-colors">
                                Download Report
                            </button>
                            <button className="flex-1 bg-white hover:bg-zinc-100 text-zinc-900 py-2 rounded-md text-xs font-semibold transition-colors">
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        </main >
    );
}

export default function DetailsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading analysis...</div>}>
            <DetailsContent />
        </Suspense>
    );
}
