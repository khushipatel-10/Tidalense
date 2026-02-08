'use client';

import {
    Satellite,
    Droplets,
    CloudRain,
    Activity,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    ShieldAlert
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface AlgaeDashboardProps {
    data: {
        risk_score: number;
        risk_level: string;
        drivers: string[];
        action: string;
        details: string;
        advanced_data?: {
            satellite: {
                analysis_date: string;
                ndvi_anomaly: number;
                chlorophyll_a: number;
                cyanobacteria_index: string;
            };
            nutrients: {
                nitrogen: number;
                phosphorus: number;
            };
            forecast: Array<{ day: string; risk: number }>;
            management_actions: string[];
        };
    };
}

export default function AlgaeDashboard({ data }: AlgaeDashboardProps) {
    if (!data.advanced_data) return null;

    const { satellite, nutrients, forecast, management_actions } = data.advanced_data;

    // Determine color theme based on risk
    const isCritical = data.risk_level === 'Critical';
    const isHigh = data.risk_level === 'High';
    const themeColor = isCritical ? 'text-red-400' : isHigh ? 'text-orange-400' : 'text-green-400';
    const borderColor = isCritical ? 'border-red-500/30' : isHigh ? 'border-orange-500/30' : 'border-green-500/30';
    const bgColor = isCritical ? 'bg-red-950/20' : isHigh ? 'bg-orange-950/20' : 'bg-green-950/20';
    const chartColor = isCritical ? '#f87171' : isHigh ? '#fb923c' : '#4ade80';

    return (
        <div className={`rounded-xl border ${borderColor} ${bgColor} overflow-hidden backdrop-blur-md`}>

            {/* Header */}
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className={`font-bold uppercase font-mono text-lg flex items-center gap-2 ${themeColor}`}>
                        <Satellite className="w-5 h-5" />
                        HAB Early Warning System
                    </h3>
                    <p className="text-sm text-zinc-400">Multi-modal Predictive Analysis</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="block text-xs text-zinc-500 uppercase tracking-widest">Current Risk</span>
                        <span className={`font-black text-2xl ${themeColor}`}>{data.risk_level.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/5">

                {/* 1. Satellite & Environmental Data */}
                <div className="p-6 space-y-6">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        Satellite Telemetry
                    </h4>

                    <div className="space-y-4">
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                            <div>
                                <span className="block text-xs text-zinc-500">Chlorophyll-a</span>
                                <span className="text-lg font-mono text-white">{satellite.chlorophyll_a} µg/L</span>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded border ${satellite.chlorophyll_a > 20 ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-green-500/30 bg-green-500/10 text-green-400'
                                }`}>
                                {satellite.chlorophyll_a > 20 ? 'BLOOM DETECTED' : 'NORMAL'}
                            </div>
                        </div>

                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                            <div>
                                <span className="block text-xs text-zinc-500">NDVI Anomaly</span>
                                <span className="text-lg font-mono text-white">{satellite.ndvi_anomaly > 0 ? '+' : ''}{satellite.ndvi_anomaly}</span>
                            </div>
                            <Satellite className="w-5 h-5 text-zinc-600" />
                        </div>

                        <div className="pt-2">
                            <h5 className="text-xs text-zinc-500 mb-2">Nutrient Load (N:P Ratio)</h5>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-blue-900/10 border border-blue-500/20 p-2 rounded text-center">
                                    <span className="block text-[10px] text-zinc-400">Nitrogen</span>
                                    <span className="font-bold text-blue-400">{nutrients.nitrogen} mg/L</span>
                                </div>
                                <div className="flex-1 bg-purple-900/10 border border-purple-500/20 p-2 rounded text-center">
                                    <span className="block text-[10px] text-zinc-400">Phosphorus</span>
                                    <span className="font-bold text-purple-400">{nutrients.phosphorus} mg/L</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Predictive Modeling */}
                <div className="p-6 relative">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        7-Day Risk Model
                    </h4>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecast}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="#666"
                                    tick={{ fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="risk"
                                    stroke={chartColor}
                                    strokeWidth={3}
                                    dot={{ fill: '#000', stroke: chartColor, strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: chartColor }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-4 text-xs text-zinc-500 italic text-center">
                        ML forecast based on weather patterns & nutrient latency.
                    </p>
                </div>

                {/* 3. Manager Actions */}
                <div className="p-6 bg-black/20">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                        <ShieldAlert className="w-4 h-4 text-orange-400" />
                        Manager Protocols
                    </h4>
                    <ul className="space-y-3">
                        {management_actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                                <CheckCircle2 className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
                                <span>{action}</span>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => window.print()}
                        className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg py-2 text-xs font-semibold transition-colors">
                        Generate PDF Report
                    </button>
                </div>

            </div>
        </div>
    );
}
