import json
import tempfile
import unittest
from pathlib import Path

from completion_importer import scan


class CompletionImporterTests(unittest.TestCase):
    def test_scans_extended_categories(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            config = root / "config"
            config.mkdir()
            (config / "atm10.json").write_text(json.dumps({
                "machines": ["digital_miner", "simulation_chamber"],
                "resources": ["allthemodium", "prediction_matrix"],
                "automation": ["fissile_fuel", "processing_pattern"],
                "goals": ["atm_star", "starry_bee"],
                "boss": "netherite_monstrosity",
                "structure": "piglich_pyramid",
            }), encoding="utf-8")

            result = scan(root)["extra"]
            self.assertIn("Digital Miner", result["machines"])
            self.assertIn("Simulation Chamber", result["machines"])
            self.assertIn("Allthemodium", result["resources"])
            self.assertIn("Fissile Fuel production", result["automations"])
            self.assertIn("AE2 autocrafting", result["automations"])
            self.assertIn("ATM Star", result["endgame"])
            self.assertIn("Netherite Monstrosity", result["bosses"])
            self.assertIn("Piglich Pyramid", result["structures"])


if __name__ == "__main__":
    unittest.main()
