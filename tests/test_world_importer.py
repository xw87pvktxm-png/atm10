import math
import unittest

from world_importer import dominant_palette, unpack_values


def pack_dense(values: list[int], bits: int) -> list[int]:
    words = [0] * math.ceil(len(values) * bits / 64)
    mask = (1 << bits) - 1
    for index, value in enumerate(values):
        bit_index = index * bits
        word_index, offset = divmod(bit_index, 64)
        words[word_index] |= (value & mask) << offset
        if offset + bits > 64:
            words[word_index + 1] |= (value & mask) >> (64 - offset)
    return words


def pack_padded(values: list[int], bits: int) -> list[int]:
    values_per_word = 64 // bits
    words = [0] * math.ceil(len(values) / values_per_word)
    mask = (1 << bits) - 1
    for index, value in enumerate(values):
        word_index, offset_index = divmod(index, values_per_word)
        words[word_index] |= (value & mask) << (offset_index * bits)
    return words


class PaletteDecodingTests(unittest.TestCase):
    def test_unpacks_dense_layout_that_crosses_word_boundaries(self) -> None:
        values = [index % 17 for index in range(100)]

        self.assertEqual(unpack_values(pack_dense(values, 5), len(values), 5), values)

    def test_unpacks_modern_word_padded_layout(self) -> None:
        values = [index % 17 for index in range(100)]

        self.assertEqual(unpack_values(pack_padded(values, 5), len(values), 5), values)

    def test_block_palette_respects_four_bit_minimum(self) -> None:
        palette = [
            {"Name": "minecraft:stone"},
            {"Name": "minecraft:diamond_ore"},
            {"Name": "minecraft:dirt"},
        ]
        indices = [1] * 12 + [0] * 3 + [2]

        dominant, counts = dominant_palette(
            palette,
            pack_padded(indices, 4),
            len(indices),
            minimum_bits=4,
        )

        self.assertEqual(dominant, "minecraft:diamond_ore")
        self.assertEqual(counts["minecraft:diamond_ore"], 12)
        self.assertEqual(sum(counts.values()), len(indices))

    def test_rejects_invalid_bit_width(self) -> None:
        with self.assertRaises(ValueError):
            unpack_values([0], 1, 0)


if __name__ == "__main__":
    unittest.main()
