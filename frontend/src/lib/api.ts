import { OpticalMetrics } from "./ai/opencv-processor";

export interface AnalysisResponse {
    risk_score: number;
    risk_level: string;
    gemini_analysis: {
        mode_detected?: string;
        severity_level?: string;
        brand_analysis?: {
            detected: boolean;
            brand_name: string;
            reputation: string;
            recall_info: string;
        };
        reasoning: string;
        visual_analysis?: string;
        score_breakdown?: {
            factor: string;
            score: number;
            contribution: string;
        }[];
        potential_harms?: string[];
        recommendations?: string[];
        details: string;
        tags: string[];
    };
    external_data?: {
        source: string;
        station_name: string;
        parameters: Record<string, string>;
    } | null;
    algae_analysis?: {
        risk_score: number;
        risk_level: string;
        drivers: string[];
        action: string;
        details: string;
    };
    technical_breakdown: {
        turbidity_contribution: number;
        edge_contribution: number;
        ai_expert_contribution: number;
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function analyzeScan(
    imageBase64: string,
    metrics: OpticalMetrics,
    embeddings: number[],
    lat?: number,
    lon?: number
): Promise<AnalysisResponse> {
    try {
        const response = await fetch(`${API_URL}/api/v1/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_base64: imageBase64,
                optical_metrics: metrics,
                embeddings: embeddings,
                geo_lat: lat,
                geo_lon: lon
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Analysis Failed:", error);
        console.error("Attempted URL:", `${API_URL}/api/v1/analyze`);
        // Return mock data for demo if backend fails
        return {
            risk_score: 0,
            risk_level: "Connection Error",
            gemini_analysis: {
                reasoning: `Could not connect to Expert Backend at ${API_URL}`,
                details: "Please ensure the backend is running and accessible (check CORS/Network).",
                tags: ["error"]
            },
            technical_breakdown: {
                turbidity_contribution: 0,
                edge_contribution: 0,
                ai_expert_contribution: 0
            }
        };
    }
}
