from typing import Dict, Any, List

def assess_algae_risk(usgs_data: Dict[str, Any], gemini_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Assess the risk of Harmful Algal Blooms (HABs) by combining:
    1. USGS Real-time Data (Water Temp, pH, Turbidity, Dissolved Oxygen)
    2. Visual Analysis (Green water, scum, foam detected by Gemini)
    """
    
    score = 0
    drivers = []
    
    # --- 1. USGS Data Analysis ---
    if usgs_data and 'parameters' in usgs_data:
        params = usgs_data['parameters']
        
        # Temperature (Warm water > 20C promotes algae)
        # Format usually "24.5 deg C"
        temp_str = params.get('Temperature, water,', '') or params.get('Temperature', '')
        if temp_str:
            try:
                temp_val = float(temp_str.split()[0])
                if temp_val > 25:
                    score += 30
                    drivers.append(f"High Water Temp ({temp_val}°C)")
                elif temp_val > 20:
                    score += 15
                    drivers.append(f"Warm Water ({temp_val}°C)")
            except:
                pass

        # pH (Algae blooms can raise pH > 8.5 due to CO2 consumption)
        ph_str = params.get('pH', '')
        if ph_str:
            try:
                ph_val = float(ph_str.split()[0])
                if ph_val > 9.0:
                    score += 25
                    drivers.append(f"Very High pH ({ph_val})")
                elif ph_val > 8.5:
                    score += 15
                    drivers.append(f"Elevated pH ({ph_val})")
            except:
                pass
                
        # Turbidity (Biomass/Sales)
        turb_str = params.get('Turbidity', '')
        if turb_str:
            try:
                turb_val = float(turb_str.split()[0])
                if turb_val > 50:
                    score += 20
                    drivers.append("High Turbidity")
                elif turb_val > 10:
                    score += 10
            except:
                pass

    # --- 2. Visual Analysis (Gemini) ---
    # Look for keywords in reasoning or tags
    visual_text = (gemini_analysis.get('visual_analysis', '') + " " + 
                   gemini_analysis.get('reasoning_short', '')).lower()
    
    high_risk_keywords = ['algae', 'algal', 'green scum', 'cyanobacteria', 'blue-green']
    mod_risk_keywords = ['green water', 'turbid green', 'vegetation', 'moss']
    
    visual_score = 0
    if any(k in visual_text for k in high_risk_keywords):
        visual_score = 50
        drivers.append("Visual Detection (Scum/Algae)")
    elif any(k in visual_text for k in mod_risk_keywords):
        visual_score = 30
        drivers.append("Visual Detection (Green Coloration)")
        
    score += visual_score
    
    # --- 3. Determine Risk Level ---
    risk_level = "Low"
    action = "Conditions are unlikely to support a bloom currently."
    
    if score >= 60:
        risk_level = "Critical"
        action = "DO NOT ENTER WATER. High likelihood of toxic cyanobacteria."
    elif score >= 40:
        risk_level = "High"
        action = "Conditions favorable for HABs. Avoid contact if scum is visible."
    elif score >= 20:
        risk_level = "Moderate"
        action = "Monitor for changes in water color or smell."
        
    # Cap score at 100
    score = min(100, score)

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "drivers": drivers,
        "action": action,
        "details": f"Combined analysis of {len(drivers)} risk factors."
    }
