ATM10 Ultimate Guide — Installable Offline App

How to use:
1. Extract this ZIP.
2. Serve the folder through a local or web server (PWA installation does not work reliably from file://).
3. Open index.html through http:// or https://.
4. Use the Install App button in the guide, or your browser's “Install app / Add to Home Screen” option.

Quick local server examples:
- Python: python -m http.server 8000
- Then open: http://localhost:8000

Favorites, notes, themes, language, and progress are stored locally in the browser.


v14 Toolkit features:
- Real item pages
- Official Mekanism multiblock constraints and layouts
- Antimatter, compressed blocks, Powah, Mana, LP, and ATM Star calculators
- Next-step recommendation
- Equipment planner
- Resource priority dashboard
- Boss and dimension trackers
- Base planner
- Troubleshooting search

- v15: 3D layer-by-layer multiblock viewer with rotation, zoom, transparent and exploded modes.


v16 3D World:
- Interactive schematic maps for Overworld, Nether, End, Twilight Forest, and Bumblezone
- Filters for ores, structures, bosses, biomes, portals, and resources
- Rotation and zoom
- Custom coordinate markers saved locally
- Seed-dependent limitation clearly displayed


v17 Real World Import:
- world_importer.py reads level.dat and region/*.mca locally
- extracts real chunks, dominant biomes, terrain height, selected ores and structure starts
- app imports atm10-world-map.json and renders a rotatable 3D chunk map

Example:
python world_importer.py /path/to/world --output atm10-world-map.json --radius 16


v18 Cloud + Updates:
- Optional Supabase cloud sync with Auth and RLS
- Upload/download/merge app state across devices
- Daily ATM10 update checks
- Exact CurseForge check when an API key is supplied
- Official GitHub changelog fallback
- Guide update feed through updates.json
- See CLOUD_AND_UPDATES.md and supabase_setup.sql


v19 Online Images:
- Primary image source: official Modrinth project galleries
- Fallback links: official CurseForge project pages
- Images remain remote and are not redistributed in the ZIP
- Seven-day local metadata cache
- Fullscreen image zoom
- Internet is required for the first load of each gallery


v22 Accounts:
- Minha conta login/signup modal
- Persistent Supabase session
- Account profile and sync status
- Automatic cloud sync after changes
- Manual upload/download and logout
