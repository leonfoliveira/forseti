import pytest

from autojudge.util.parse_util import _to_float_or_none, _to_int_or_none


@pytest.mark.parametrize(
    "value,expected", [("10", 10), (None, None), ("abc", None), ("1.5", None)]
)
def test_to_int_or_none(value, expected):
    assert _to_int_or_none(value) == expected


@pytest.mark.parametrize(
    "value,expected", [("1.5", 1.5), ("2", 2.0), (None, None), ("abc", None)]
)
def test_to_float_or_none(value, expected):
    assert _to_float_or_none(value) == expected
