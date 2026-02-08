import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

async def fetch_usgs_water_data(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """
    Fetches real-time water quality data from the nearest USGS monitoring station.
    Uses the NLDI (Network Linked Data Index) API to find the station and then Water Services.
    """
    if not lat or not lon:
        return None

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # 1. Find nearest station using NLDI
            # https://labs.waterdata.usgs.gov/api/nldi/linked-data/comid/position?coords=POINT(-97.7431 30.2672)
            # Note: NLDI usually takes lon,lat WKT
            
            # Implementation Strategy: 
            # Direct radius search on Water Services is often easier than NLDI for "nearest data-having station".
            # https://waterservices.usgs.gov/nwis/iv/?format=json&latLongBoundingBox=...
            # But let's try a small radius search around the point.
            
            # Bounding box: roughly +/- 0.1 degrees (approx 10km)
            box_width = 0.1
            west = lon - box_width
            east = lon + box_width
            south = lat - box_width
            north = lat + box_width
            
            # Parameters:
            # 00010 = Temperature, water
            # 00400 = pH
            # 63680 = Turbidity
            # 00095 = Specific conductance
            # 00300 = Dissolved oxygen
            
            parameter_codes = "00010,00400,63680,00095,00300"
            
            url = f"https://waterservices.usgs.gov/nwis/iv/?format=json&bBox={west:.4f},{south:.4f},{east:.4f},{north:.4f}&parameterCd={parameter_codes}&siteStatus=active"
            
            response = await client.get(url)
            
            if response.status_code != 200:
                logger.warning(f"USGS API Error: {response.status_code} {response.text}")
                return None
                
            data = response.json()
            time_series = data.get('value', {}).get('timeSeries', [])
            
            if not time_series:
                return None
                
            # Process the first/nearest site found (API usually returns multiple if box is big, but here it's small)
            # We want to aggregate parameters for the site(s) found.
            
            # Let's just take the first site's data for simplicity or aggregate by parameter.
            # Ideally we find the *closest* site, but within 0.1 deg they are all "local".
            
            result = {
                "source": "USGS Water Services",
                "station_name": "Unknown Station",
                "station_id": "",
                "parameters": {}
            }
            
            for ts in time_series:
                site_info = ts.get('sourceInfo', {})
                result['station_name'] = site_info.get('siteName')
                result['station_id'] = site_info.get('siteCode', [{}])[0].get('value')
                
                variable = ts.get('variable', {})
                var_name = variable.get('variableName', '').split(',')[0].strip() # e.g. "Temperature, water, ..." -> "Temperature"
                unit = variable.get('unit', {}).get('unitCode')
                
                values = ts.get('values', [{}])[0].get('value', [])
                if values:
                    # Get latest value
                    latest_val = values[-1].get('value')
                    result['parameters'][var_name] = f"{latest_val} {unit}"

            if not result['parameters']:
                return None
                
            return result

    except Exception as e:
        logger.error(f"Failed to fetch USGS data: {e}")
        return None
