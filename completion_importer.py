#!/usr/bin/env python3
from pathlib import Path
import argparse,json,re

CATALOGS={
 "machines":{
  "digital_miner":"Digital Miner","energizing_orb":"Energizing Orb","simulation_chamber":"Simulation Chamber",
  "loot_fabricator":"Loot Fabricator","mob_slaughter_factory":"Mob Slaughter Factory","latex_processing_unit":"Latex Processing Unit",
  "chemical_crystallizer":"Chemical Crystallizer","enrichment_chamber":"Enrichment Chamber","induction_matrix":"Induction Matrix",
  "fission_reactor":"Fission Reactor","industrial_turbine":"Industrial Turbine","fusion_reactor":"Fusion Reactor"
 },
 "resources":{
  "allthemodium":"Allthemodium","vibranium":"Vibranium","unobtainium":"Unobtainium","fluorite":"Fluorite",
  "uranium":"Uranium","osmium":"Osmium","antimatter":"Antimatter","polonium":"Polonium","nether_star":"Nether Star",
  "prediction_matrix":"Prediction Matrix","precision_mechanism":"Precision Mechanism","gaia_spirit":"Gaia Spirit"
 },
 "bosses":{
  "ender_dragon":"Ender Dragon","warden":"Warden","wither":"Wither","naga":"Naga","twilight_lich":"Twilight Lich",
  "minoshroom":"Minoshroom","hydra":"Hydra","ur_ghast":"Ur-Ghast","alpha_yeti":"Alpha Yeti","snow_queen":"Snow Queen",
  "wilden_chimera":"Wilden Chimera","netherite_monstrosity":"Netherite Monstrosity","ender_guardian":"Ender Guardian","leviathan":"The Leviathan","ignis":"Ignis"
 },
 "structures":{
  "ancient_city":"Ancient City","end_city":"End City","stronghold":"Stronghold","piglich_pyramid":"Piglich Pyramid",
  "ruined_citadel":"Ruined Citadel","soul_blacksmith":"Soul Blacksmith","aurora_palace":"Aurora Palace","lich_tower":"Lich Tower"
 }
}

def add(o,k,v):
 v=str(v).strip().replace("\n"," ")
 if 2<len(v)<140:o.setdefault(k,set()).add(v)
def scan(root):
 o={k:set() for k in ("quests","achievements","bees","seeds","charms","dimensions","machines","automations","resources","endgame","structures","bosses")};state={}
 for p in root.rglob("*"):
  if not p.is_file() or p.stat().st_size>5000000 or p.suffix.lower() not in {".json",".snbt",".js",".zs",".toml",".txt"}:continue
  rel=str(p.relative_to(root)).replace("\\","/").lower()
  try:t=p.read_text(encoding="utf-8",errors="ignore")
  except:continue
  searchable=(rel+"\n"+t).lower().replace("-","_").replace(" ","_")
  for category,catalog in CATALOGS.items():
   for token,label in catalog.items():
    if token in searchable:add(o,category,label)
  if any(x in searchable for x in ("autocrafting","processing_pattern","crafting_pattern")):add(o,"automations","AE2 autocrafting")
  if "fissile_fuel" in searchable:add(o,"automations","Fissile Fuel production")
  if "antimatter" in searchable:add(o,"automations","Antimatter production")
  if "atm_star" in searchable or "allthemods:atm_star" in searchable:add(o,"endgame","ATM Star")
  if "starry_bee" in searchable:add(o,"endgame","Starry Bee")
  if "ftbquests" in rel:
   for m in re.finditer(r"(?:title|subtitle|description)\s*[:=]\s*[\"']([^\"']{3,120})[\"']",t,re.I):add(o,"quests",m.group(1))
  if "/advancements/" in "/"+rel and p.suffix.lower()==".json":
   try:
    d=json.loads(t)
    for i,v in d.items():add(o,"achievements",i);state[f"achievements:{i}"]=bool(isinstance(v,dict) and v.get("done"))
   except:pass
  if re.search(r"productive.?bees|productivebees",rel):
   for m in re.finditer(r"[\"']([a-z0-9_:-]*bee[a-z0-9_:-]*)[\"']",t,re.I):add(o,"bees",m.group(1).split(":")[-1].replace("_"," "))
  if re.search(r"mystical.?agriculture|mysticalagriculture",rel):
   for m in re.finditer(r"[\"']([a-z0-9_:-]*seeds?)[\"']",t,re.I):add(o,"seeds",m.group(1).split(":")[-1].replace("_"," "))
  if "charm" in rel or "apotheosis" in rel:
   for m in re.finditer(r"[\"']([a-z0-9_:-]*charm[a-z0-9_:-]*)[\"']",t,re.I):add(o,"charms",m.group(1).split(":")[-1].replace("_"," "))
  if "/dimensions/" in "/"+rel:
   a=rel.split("/");i=a.index("dimensions");
   if len(a)>i+2:add(o,"dimensions",a[i+1]+":"+a[i+2])
 return {"version":1,"state":state,"extra":{k:sorted(v) for k,v in o.items()}}
if __name__=="__main__":
 a=argparse.ArgumentParser();a.add_argument("folder");a.add_argument("-o","--output",default="atm10-completion-import.json");x=a.parse_args();d=scan(Path(x.folder));Path(x.output).write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding="utf-8");print(x.output)
