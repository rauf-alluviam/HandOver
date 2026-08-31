import json
import os

with open(r'c:\Users\india\Desktop\projects\HandOver\cfs_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total raw items: {len(data)}")

# Group by locId (e.g. INNSA1, INMUN1, INMAA1, INTUT1, etc.)
cfs_by_loc = {}
all_cfs_list = []
seen_codes = set()

for item in data:
    code = (item.get('CFS_CODE') or '').strip().upper()
    if not code:
        continue
    
    cfs_name = (item.get('CFS_NM') or '').strip()
    loc_nm = (item.get('LOC_NM') or '').strip()

    if code in seen_codes:
        continue
    seen_codes.add(code)

    label = f"{code} - {cfs_name}" if cfs_name else code
    entry = {
        'value': code,
        'label': label,
        'cfsCode': code,
        'cfsName': cfs_name,
        'locNm': loc_nm
    }

    all_cfs_list.append(entry)

    # Determine port key prefix
    # e.g., INNSA1, INMUN1, INMAA1, INTUT1, INCCU1, INPAV1, INHZA1, INCOK1, INVTZ1, INHAL1, INKRI1, INKAT1, INKAK1, INMRM1
    port_prefix = code[:6]
    cfs_by_loc.setdefault(port_prefix, []).append(entry)

    # Also map by Location Name (lowercase key)
    loc_key = loc_nm.lower()
    cfs_by_loc.setdefault(loc_key, []).append(entry)

print(f"Total unique CFS entries: {len(all_cfs_list)}")

# Generate client JS file: client/src/data/cfsMasterData.js
js_content = f"""// client/src/data/cfsMasterData.js
// Generated from cfs-loc-code.xlsx ({len(all_cfs_list)} CFS Locations)

export const CFS_LOCATION_MASTER = {json.dumps(all_cfs_list, indent=2)};

export const CFS_BY_LOCATION_MAP = {json.dumps(cfs_by_loc, indent=2)};

export const getCFSCodesForLocation = (locId, locNm = "") => {{
  if (!locId && !locNm) return CFS_LOCATION_MASTER;

  const results = [];
  const seen = new Set();

  const addEntries = (list) => {{
    if (!Array.isArray(list)) return;
    for (const item of list) {{
      if (item && item.value && !seen.has(item.value)) {{
        seen.add(item.value);
        results.push(item);
      }}
    }}
  }};

  if (locId) {{
    const normLoc = locId.toUpperCase().trim();
    // Direct match (e.g. INNSA1)
    if (CFS_BY_LOCATION_MAP[normLoc]) {{
      addEntries(CFS_BY_LOCATION_MAP[normLoc]);
    }}

    // Prefix match (e.g. INMAA matching INMAA1, INMAA4)
    const prefix5 = normLoc.substring(0, 5);
    for (const key of Object.keys(CFS_BY_LOCATION_MAP)) {{
      if (key.startsWith(prefix5)) {{
        addEntries(CFS_BY_LOCATION_MAP[key]);
      }}
    }}

    // Code startsWith match
    const matchedByPrefix = CFS_LOCATION_MASTER.filter(c => 
      c.value.toUpperCase().startsWith(normLoc) || c.value.toUpperCase().startsWith(prefix5)
    );
    addEntries(matchedByPrefix);
  }}

  if (locNm) {{
    const normNm = locNm.toLowerCase().trim();
    if (CFS_BY_LOCATION_MAP[normNm]) {{
      addEntries(CFS_BY_LOCATION_MAP[normNm]);
    }}
    const matchedByNm = CFS_LOCATION_MASTER.filter(c => 
      c.locNm.toLowerCase().includes(normNm) || normNm.includes(c.locNm.toLowerCase())
    );
    addEntries(matchedByNm);
  }}

  if (results.length === 0) {{
    return CFS_LOCATION_MASTER;
  }}

  return results.sort((a, b) => a.label.localeCompare(b.label));
}};

export default CFS_LOCATION_MASTER;
"""

output_path = r'c:\Users\india\Desktop\projects\HandOver\client\src\data\cfsMasterData.js'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Successfully generated {output_path}")
