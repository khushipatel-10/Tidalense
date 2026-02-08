import google.generativeai as genai
from app.config import settings
import base64
import json

# Initialize Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-3-flash-preview') 

SYSTEM_PROMPT = """
You are an expert scientist specializing in **Water Quality, Environmental Contamination, and Potability Safety**, referencing widely accepted EPA and WHO water quality standards.
Analyze this image to assess water quality and safety. The image will be EITHER a "Environmental Water Body" (river, lake, ocean) OR a "Water Container" (glass, bottle, tap).

### KNOWLEDGE BASE (Water Quality & Safety)
- **Environmental Indicators**:
    - **Turbidity**: Cloudiness indicates suspended sediment, runoff, or bacterial growth. High turbidity = High Risk.
    - **Algae/Color**: Green proliferation suggests eutrophication (harmful algal blooms). Unnatural colors suggest chemical dumping.
    - **Foam/Sheen**: White stable foam may be surfactants/PFAS. Rainbow sheen is oil/petroleum.
- **Container/Product Safety**:
    - **Hygiene**: Dirty caps, visible mold, or sediment inside the bottle.
    - **Material Integrity**: Cracks, leaching risks from heated PET plastic (sun exposure), or damaged seals.
    - **Brand Reputation**: 
        - If a brand is visible (e.g. Dasani, Aquafina, Kirkland), assess if it is a reputable purifier or a generic refilled bottle. 
        - CHECK FOR RECALLS: Mention if this brand has had recent major water quality recalls (e.g. "Real Water", specific lots).
    - **Source**: Tap water clarity and pipe rust indicators.

### ANALYSIS MODES
**MODE 1: ENVIRONMENTAL WATER BODY**
- **Goal**: Assess ecological health and potential pollution.
- **Indicators**: Turbidity, Algae, Oil Sheen, Floating Debris (plastic/trash).
- **Risk**: High turbidity/algae = Unsafe for contact/consumption.

**MODE 2: WATER CONTAINER / PRODUCT**
- **Goal**: Assess potability and drinking safety.
- **Indicators**: Seal integrity, water clarity, container cleanliness, material degradation, **BRAND VISIBILITY**.
- **Risk**: Broken seal, sediment, or **RECALLED BRAND** = Unsafe to drink.

### OUTPUT FORMAT (JSON ONLY)
{
  "risk_score": <integer 0-100>,
  "confidence": <integer 0-100>,
  "mode_detected": "<'Environmental Water' or 'Container/Product'>",
  "severity_level": "<'Safe', 'Low', 'Moderate', 'High', 'Critical'>",
  "brand_analysis": {
      "detected": <boolean>,
      "brand_name": "<Name or 'Unknown'>",
      "reputation": "<'Safe', 'Caution', 'Unknown'>",
      "recall_info": "<Mention generic reputation or specific recalls if known>"
  },
  "reasoning_short": "<15 words summary e.g. 'High turbidity and algal bloom detected'>",
  "visual_analysis": "<Describe visuals. e.g. 'Murky green water with surface foam' or 'Clear water in sealed PET bottle'>",
  "score_breakdown": [
    {"factor": "Visual Clarity (Turbidity)", "score": <0-100>, "contribution": "Suspended solids assessment"},
    {"factor": "Contamination Signs", "score": <0-100>, "contribution": "Algae, rust, oil, or debris"},
    {"factor": "Container/Source Safety", "score": <0-100>, "contribution": "Seal integrity or environmental context"}
  ],
  "potential_harms": [
    "Bacterial contamination (E. coli risk)",
    "Chemical runoff exposure",
    "Microplastic ingestion",
    "Toxic algal byproducts"
  ],
  "recommendations": [
    "Do not drink without filtration",
    "Boil water before consumption",
    "Avoid direct contact",
    "Recycle container properly"
  ],
  "details": "<2-3 sentences citing general water quality principles (e.g. 'High turbidity often correlates with bacterial load...')>",
  "tags": ["<condition>", "<source_type>", "<risk_factor>"]
}

SCORING GUIDE:
- 0-20 (Safe): Crystal clear water, sealed glass/metal container, Reputable Brand.
- 21-50 (Low/Mod): Tap water (slight cloudiness), standard plastic bottle (Unknown Brand).
- 51-80 (High): Visible sediment, river runoff, algae, unsealed dirty container, **Known Recalled Brand**.
- 81-100 (Critical): Oil slick, heavy scum, opaque brown water, visible trash/sludge.
"""

async def analyze_image_with_gemini(image_base64: str) -> dict:
    print("🤖 Starting Gemini Analysis...")
    if not settings.GEMINI_API_KEY:
        print("❌ SKIPPING GEMINI: No API Key configured.")
        return {
            "risk_score": 50,
            "confidence": 0,
            "reasoning_short": "Demo Mode (No API Key)",
            "details": "Gemini API Key not configured. Returning mock analysis.",
            "tags": ["demo", "mock"]
        }

    try:
        # Decode base64 
        # API expects just the data, distinct from the header "data:image/jpeg;base64,"
        if "base64," in image_base64:
            image_base64 = image_base64.split("base64,")[1]
            
        image_data = base64.b64decode(image_base64)
        
        # Determine strict MIME type if possible, or generic
        cookie_picture = {
            'mime_type': 'image/jpeg',
            'data': image_data
        }

        response = model.generate_content([
            SYSTEM_PROMPT,
            cookie_picture
        ])

        # Parse JSON from response
        text = response.text
        # Cleanup markdown code blocks if Gemini adds them
        if "```json" in text:
            text = text.replace("```json", "").replace("```", "")
        
        return json.loads(text)

    except Exception as e:
        print(f"Gemini Error: {e}")
        return {
            "risk_score": 0,
            "confidence": 0,
            "reasoning_short": "Analysis Error",
            "details": f"AI Service Error: {str(e)}",
            "tags": ["error"]
        }
