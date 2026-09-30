def _to_int_or_none(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _to_float_or_none(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
