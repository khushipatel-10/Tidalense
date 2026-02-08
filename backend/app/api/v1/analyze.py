from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from app.services.gemini import analyze_image_with_gemini
from app.services.risk_engine import calculate_total_risk

router = APIRouter()

class OpticalMetricsModel(BaseModel):
    turbidityScore: float
    edgeDensity: float
    labVariance: float

class AnalyzeRequest(BaseModel):
    image_base64: str
    optical_metrics: OpticalMetricsModel
    geo_lat: Optional[float] = None
    geo_lon: Optional[float] = None
    embeddings: Optional[List[float]] = None

@router.post("/analyze")
async def analyze_scan(request: AnalyzeRequest):
    # 0. External Data (Parallelizable)
    external_data = None
    if request.geo_lat and request.geo_lon:
        from app.services.usgs import fetch_usgs_water_data
        try:
            external_data = await fetch_usgs_water_data(request.geo_lat, request.geo_lon)
        except Exception as e:
            print(f"USGS Fetch Failed: {e}")

    # 1. Gemini Analysis
    gemini_result = await analyze_image_with_gemini(request.image_base64)
    
    # 2. Risk Synthesis
    risk_assessment = calculate_total_risk(
        request.optical_metrics.dict(), 
        gemini_result
    )

    # 3. Algae Bloom Risk Analysis
    from app.services.algae_risk import assess_algae_risk
    algae_analysis = assess_algae_risk(external_data, gemini_result)
    
    # 4. Construct Response
    return {
        "status": "success",
        "risk_score": risk_assessment["score"],
        "risk_level": risk_assessment["level"],
        "gemini_analysis": {
            "mode_detected": gemini_result.get("mode_detected", "Unknown"),
            "severity_level": gemini_result.get("severity_level", "Unknown"),
            "brand_analysis": gemini_result.get("brand_analysis", {}),
            "reasoning": gemini_result.get("reasoning_short"),
            "visual_analysis": gemini_result.get("visual_analysis"),
            "score_breakdown": gemini_result.get("score_breakdown", []),
            "potential_harms": gemini_result.get("potential_harms", []),
            "recommendations": gemini_result.get("recommendations", []),
            "details": gemini_result.get("details"),
            "tags": gemini_result.get("tags")
        },
        "external_data": external_data,
        "algae_analysis": algae_analysis,
        "technical_breakdown": risk_assessment["breakdown"]
    }
