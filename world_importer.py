#!/usr/bin/env python3
"""ATM10 world save importer.

Reads a Minecraft Java world/server folder and creates a lightweight JSON map for
ATM10 Ultimate Guide. Uses only Python's standard library.

Usage:
  python world_importer.py /path/to/world --output atm10-world-map.json --radius 12

The importer reads level.dat and region/*.mca files. It extracts real chunk
coordinates, average surface height, biome palettes, selected ore counts, and
structure start IDs. It does not modify the world.
"""
from __future__ import annotations

import argparse
import gzip
import json
import math
from pathlib import Path
import re
import struct
import sys
import zlib
from collections import Counter
from typing import Any

ORE_NAMES = {
    "allthemodium:allthemodium_ore",
    "allthemodium:allthemodium_slate_ore",
    "allthemodium:vibranium_ore",
    "allthemodium:unobtainium_ore",
    "minecraft:diamond_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:ancient_debris",
    "mekanism:osmium_ore",
    "mekanism:deepslate_osmium_ore",
    "mekanism:uranium_ore",
    "mekanism:deepslate_uranium_ore",
    "mekanism:fluorite_ore",
    "mekanism:deepslate_fluorite_ore",
}

class NBTReader:
    def __init__(self, data: bytes):
        self.data = memoryview(data)
        self.pos = 0

    def read(self, n: int) -> bytes:
        if self.pos + n > len(self.data):
            raise EOFError("Unexpected end of NBT data")
        b = self.data[self.pos:self.pos+n].tobytes()
        self.pos += n
        return b

    def u8(self) -> int: return self.read(1)[0]
    def i8(self) -> int: return struct.unpack(">b", self.read(1))[0]
    def i16(self) -> int: return struct.unpack(">h", self.read(2))[0]
    def i32(self) -> int: return struct.unpack(">i", self.read(4))[0]
    def i64(self) -> int: return struct.unpack(">q", self.read(8))[0]
    def f32(self) -> float: return struct.unpack(">f", self.read(4))[0]
    def f64(self) -> float: return struct.unpack(">d", self.read(8))[0]
    def string(self) -> str:
        n = struct.unpack(">H", self.read(2))[0]
        return self.read(n).decode("utf-8", "replace")

    def payload(self, tag: int) -> Any:
        if tag == 0: return None
        if tag == 1: return self.i8()
        if tag == 2: return self.i16()
        if tag == 3: return self.i32()
        if tag == 4: return self.i64()
        if tag == 5: return self.f32()
        if tag == 6: return self.f64()
        if tag == 7:
            n = self.i32(); return list(self.read(n))
        if tag == 8: return self.string()
        if tag == 9:
            child = self.u8(); n = self.i32()
            return [self.payload(child) for _ in range(max(0, n))]
        if tag == 10:
            out = {}
            while True:
                child = self.u8()
                if child == 0: break
                name = self.string()
                out[name] = self.payload(child)
            return out
        if tag == 11:
            n = self.i32(); return [self.i32() for _ in range(max(0, n))]
        if tag == 12:
            n = self.i32(); return [self.i64() for _ in range(max(0, n))]
        raise ValueError(f"Unsupported NBT tag {tag}")

    def root(self) -> tuple[str, Any]:
        tag = self.u8()
        if tag == 0: return "", None
        name = self.string()
        return name, self.payload(tag)


def read_nbt_bytes(data: bytes) -> Any:
    return NBTReader(data).root()[1]


def read_level_dat(path: Path) -> dict[str, Any]:
    try:
        with gzip.open(path, "rb") as f:
            root = read_nbt_bytes(f.read())
        data = root.get("Data", root) if isinstance(root, dict) else {}
        version = data.get("Version", {}) if isinstance(data, dict) else {}
        return {
            "name": data.get("LevelName", path.parent.name),
            "seed": data.get("WorldGenSettings", {}).get("seed", data.get("RandomSeed")),
            "game_version": version.get("Name") if isinstance(version, dict) else None,
            "data_version": data.get("DataVersion"),
            "spawn": [data.get("SpawnX", 0), data.get("SpawnY", 64), data.get("SpawnZ", 0)],
        }
    except Exception as exc:
        return {"name": path.parent.name, "warning": f"Could not read level.dat: {exc}"}


def unsigned_long(v: int) -> int:
    return v & ((1 << 64) - 1)


def unpack_values(longs: list[int], count: int, bits: int) -> list[int]:
    """Unpack palette indices from either supported Minecraft long-array layout.

    Older chunks use a continuous bit stream whose values may cross 64-bit word
    boundaries. Modern chunks pad each word and never split a value between two
    words. The array length distinguishes the layouts whenever they differ.
    """
    if count < 0:
        raise ValueError("count must not be negative")
    if not 0 < bits <= 64:
        raise ValueError("bits must be between 1 and 64")
    if not longs or bits <= 0:
        return [0] * count

    mask = (1 << bits) - 1
    u = [unsigned_long(x) for x in longs]
    values_per_long = 64 // bits
    padded_length = math.ceil(count / values_per_long)
    dense_length = math.ceil(count * bits / 64)
    uses_padding = padded_length != dense_length and len(u) == padded_length

    if uses_padding:
        return [
            (u[index // values_per_long] >> ((index % values_per_long) * bits)) & mask
            if index // values_per_long < len(u)
            else 0
            for index in range(count)
        ]

    values = []
    for index in range(count):
        bit_index = index * bits
        li = bit_index >> 6
        off = bit_index & 63
        if li >= len(u):
            values.append(0)
        elif off + bits <= 64:
            values.append((u[li] >> off) & mask)
        else:
            low = u[li] >> off
            high_bits = off + bits - 64
            high = (u[li+1] & ((1 << high_bits) - 1)) if li + 1 < len(u) else 0
            values.append((low | (high << (64-off))) & mask)
    return values


def palette_name(entry: Any) -> str:
    if isinstance(entry, str): return entry
    if isinstance(entry, dict): return str(entry.get("Name", entry.get("name", "unknown")))
    return "unknown"


def dominant_palette(
    palette: list[Any],
    data: list[int] | None,
    count: int,
    *,
    minimum_bits: int = 1,
) -> tuple[str, Counter[str]]:
    names = [palette_name(x) for x in palette]
    if not names:
        return "unknown", Counter()
    if len(names) == 1 or not data:
        return names[0], Counter({names[0]: count})
    bits = max(minimum_bits, (len(names) - 1).bit_length())
    indices = unpack_values(data, count, bits)
    counts = Counter(names[i] if 0 <= i < len(names) else "unknown" for i in indices)
    return counts.most_common(1)[0][0], counts


def decode_heightmap(longs: list[int]) -> list[int]:
    # Heightmaps contain 256 values. For modern world heights, 9 bits is typical.
    if not longs: return []
    bits = max(1, (len(longs) * 64) // 256)
    bits = max(9, min(12, bits))
    return unpack_values(longs, 256, bits)


def normalize_chunk(root: dict[str, Any]) -> dict[str, Any]:
    if "Level" in root and isinstance(root["Level"], dict):
        return root["Level"]
    return root


def analyze_chunk(root: dict[str, Any], fallback_x: int, fallback_z: int) -> dict[str, Any]:
    c = normalize_chunk(root)
    x = int(c.get("xPos", fallback_x)); z = int(c.get("zPos", fallback_z))
    status = c.get("Status", "unknown")
    heights = c.get("Heightmaps", {}) if isinstance(c.get("Heightmaps", {}), dict) else {}
    surface_raw = heights.get("WORLD_SURFACE") or heights.get("MOTION_BLOCKING") or []
    surface = decode_heightmap(surface_raw)
    avg_height = round(sum(surface)/len(surface), 1) if surface else None
    min_height = min(surface) if surface else None
    max_height = max(surface) if surface else None

    biome_counts: Counter[str] = Counter()
    ore_counts: Counter[str] = Counter()
    sections = c.get("sections", c.get("Sections", [])) or []
    for sec in sections:
        if not isinstance(sec, dict): continue
        biomes = sec.get("biomes", sec.get("Biomes"))
        if isinstance(biomes, dict):
            pal = biomes.get("palette", []) or []
            dat = biomes.get("data")
            _, counts = dominant_palette(pal, dat, 64)
            biome_counts.update(counts)
        elif isinstance(biomes, list):
            biome_counts.update(map(str, biomes))

        bs = sec.get("block_states", sec.get("BlockStates"))
        if isinstance(bs, dict):
            pal = bs.get("palette", []) or []
            dat = bs.get("data")
            _, counts = dominant_palette(pal, dat, 4096, minimum_bits=4)
            for name, n in counts.items():
                if name in ORE_NAMES or name.endswith("_ore") or name.endswith(":ancient_debris"):
                    ore_counts[name] += n
        elif isinstance(sec.get("Palette"), list):
            pal = sec.get("Palette", [])
            dat = sec.get("BlockStates")
            _, counts = dominant_palette(pal, dat, 4096, minimum_bits=4)
            for name, n in counts.items():
                if name in ORE_NAMES or name.endswith("_ore"):
                    ore_counts[name] += n

    dominant_biome = biome_counts.most_common(1)[0][0] if biome_counts else "unknown"

    structures = []
    sroot = c.get("structures", c.get("Structures", {}))
    if isinstance(sroot, dict):
        starts = sroot.get("starts", sroot.get("Starts", {}))
        if isinstance(starts, dict):
            for key, val in starts.items():
                if isinstance(val, dict):
                    sid = val.get("id", val.get("Id", key))
                    if sid and str(sid).upper() != "INVALID": structures.append(str(sid))
                elif val: structures.append(str(key))

    return {
        "x": x, "z": z, "status": status,
        "biome": dominant_biome,
        "biomes": dict(biome_counts.most_common(8)),
        "height": {"avg": avg_height, "min": min_height, "max": max_height},
        "ores": dict(ore_counts.most_common(20)),
        "structures": sorted(set(structures)),
    }


def iter_region_chunks(path: Path):
    m = re.match(r"r\.(-?\d+)\.(-?\d+)\.mca$", path.name)
    if not m: return
    rx, rz = map(int, m.groups())
    with path.open("rb") as f:
        header = f.read(4096)
        if len(header) < 4096: return
        for i in range(1024):
            loc = header[i*4:(i+1)*4]
            offset = int.from_bytes(loc[:3], "big")
            sectors = loc[3]
            if offset == 0 or sectors == 0: continue
            local_x, local_z = i % 32, i // 32
            fallback_x, fallback_z = rx*32 + local_x, rz*32 + local_z
            try:
                f.seek(offset*4096)
                length = struct.unpack(">I", f.read(4))[0]
                compression = f.read(1)[0]
                payload = f.read(length-1)
                if compression == 1: raw = gzip.decompress(payload)
                elif compression == 2: raw = zlib.decompress(payload)
                elif compression == 3: raw = payload
                else: continue
                root = read_nbt_bytes(raw)
                if isinstance(root, dict):
                    yield analyze_chunk(root, fallback_x, fallback_z)
            except Exception:
                continue


def dimension_paths(world: Path) -> dict[str, Path]:
    out = {"minecraft:overworld": world / "region"}
    if (world / "DIM-1" / "region").exists(): out["minecraft:the_nether"] = world / "DIM-1" / "region"
    if (world / "DIM1" / "region").exists(): out["minecraft:the_end"] = world / "DIM1" / "region"
    dims = world / "dimensions"
    if dims.exists():
        for namespace in dims.iterdir():
            if not namespace.is_dir(): continue
            for dim in namespace.iterdir():
                rp = dim / "region"
                if rp.exists(): out[f"{namespace.name}:{dim.name}"] = rp
    return out


def main():
    p = argparse.ArgumentParser(description="Create an ATM10 Guide map JSON from a Minecraft Java world.")
    p.add_argument("world", type=Path, help="Path to the world/server save folder")
    p.add_argument("--output", "-o", type=Path, default=Path("atm10-world-map.json"))
    p.add_argument("--radius", type=int, default=16, help="Chunk radius around spawn; 0 scans all region files")
    p.add_argument("--dimension", action="append", help="Only include dimensions containing this text")
    args = p.parse_args()
    world = args.world.resolve()
    if not (world / "level.dat").exists():
        p.error("The selected folder does not contain level.dat")

    meta = read_level_dat(world / "level.dat")
    spawn = meta.get("spawn", [0,64,0])
    spawn_cx, spawn_cz = int(spawn[0])//16, int(spawn[2])//16
    result = {"format":"atm10-world-map-v1","generated_by":"world_importer.py","world":meta,"dimensions":{}}

    dims = dimension_paths(world)
    for dim_id, region_dir in dims.items():
        if args.dimension and not any(q.lower() in dim_id.lower() for q in args.dimension):
            continue
        chunks = []
        files = sorted(region_dir.glob("r.*.*.mca"))
        print(f"Scanning {dim_id}: {len(files)} region files", file=sys.stderr)
        for rf in files:
            for chunk in iter_region_chunks(rf):
                if args.radius > 0 and dim_id == "minecraft:overworld":
                    if abs(chunk["x"]-spawn_cx) > args.radius or abs(chunk["z"]-spawn_cz) > args.radius:
                        continue
                chunks.append(chunk)
        if chunks:
            result["dimensions"][dim_id] = {"chunks":chunks}

    args.output.write_text(json.dumps(result, ensure_ascii=False, separators=(",",":")), encoding="utf-8")
    print(f"Wrote {args.output} with {sum(len(d['chunks']) for d in result['dimensions'].values())} chunks")

if __name__ == "__main__":
    main()
