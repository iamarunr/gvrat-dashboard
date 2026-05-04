"""Location description lookup with past/approaching interpolation per SPEC §3."""
import json
from pathlib import Path


class DescriptionMap:
    def __init__(self, data: dict[int, str]) -> None:
        self._data = data
        self._keys = sorted(data.keys())

    def lookup(self, mile: int) -> str:
        if mile in self._data:
            return self._data[mile]

        preceding = [k for k in self._keys if k < mile]
        following = [k for k in self._keys if k > mile]

        _prefixed = ('past ', 'approaching ')

        # Within 2 of the preceding labeled mile → "past X"
        if preceding and mile - preceding[-1] <= 2:
            desc = self._data[preceding[-1]]
            return desc if desc.lower().startswith(_prefixed) else f"past {desc}"

        # Within 2 of the following labeled mile → "approaching Y"
        if following and following[0] - mile <= 2:
            desc = self._data[following[0]]
            return desc if desc.lower().startswith(_prefixed) else f"approaching {desc}"

        # Default: fall back to nearest preceding
        if preceding:
            desc = self._data[preceding[-1]]
            return desc if desc.lower().startswith(_prefixed) else f"past {desc}"

        return ""


def load_descriptions(race_id: str) -> DescriptionMap:
    path = Path("races") / race_id / "descriptions.json"
    if not path.exists():
        return DescriptionMap({})
    data = json.loads(path.read_text(encoding="utf-8"))
    # Keys are usually integer strings; float strings like "0.1" are truncated to int.
    return DescriptionMap({int(float(k)): v for k, v in data.items()})
