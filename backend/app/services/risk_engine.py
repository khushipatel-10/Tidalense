from typing import Dict, Any

def calculate_total_risk(
    optical_metrics: Dict[str, float],
    gemini_result: Dict[str, Any],
    geo_context: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Synthesize the final Water Quality Risk Score.
    
    Weights:
    - Optical Turbidity/Variance (OpenCV): 30%
    - Edge Density (OpenCV): 20%
    - AI Expert Analysis (Gemini): 50%
    """
    
    # Normalize inputs
    turbidity = min(100, optical_metrics.get("turbidityScore", 0))
    edge_density = min(100, optical_metrics.get("edgeDensity", 0))
    # Gemini score is already 0-100
    gemini_score = gemini_result.get("risk_score", 0)
    
    # Weighted Sum
    # Adjust weights: Gemini is smartest, but local optics are ground truth for "texture"
    score = (turbidity * 0.30) + (edge_density * 0.20) + (gemini_score * 0.50)
    
    return {
        "score": int(score),
        "level": get_risk_level(score),
        "breakdown": {
            "turbidity_contribution": int(turbidity * 0.30),
            "edge_contribution": int(edge_density * 0.20),
            "ai_expert_contribution": int(gemini_score * 0.50)
        }
    }

def get_risk_level(score: float) -> str:
    if score < 30: return "Low"
    if score < 60: return "Medium"
    return "Potential Risk"
