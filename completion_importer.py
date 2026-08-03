#!/usr/bin/env python3
from pathlib import Path
import argparse,json,re

def add(o,k,v):
 v=str(v).strip().replace("\n"," ")
 if 2<len(v)<140:o.setdefault(k,set()).add(v)
def scan(root):
 o={k:set() for k in ("quests","achievements","bees","seeds","charms","dimensions")};state={}
 for p in root.rglob("*"):
  if not p.is_file() or p.stat().st_size>5000000 or p.suffix.lower() not in {".json",".snbt",".js",".zs",".toml",".txt"}:continue
  rel=str(p.relative_to(root)).replace("\\","/").lower()
  try:t=p.read_text(encoding="utf-8",errors="ignore")
  except:continue
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
