from pydantic import BaseModel
from typing import Optional


class IsolateMeta(BaseModel):
    class Status:
        RE = "RE"
        SG = "SG"
        TO = "TO"
        XX = "XX"

    exit_code: Optional[int]
    max_rss: Optional[int]
    status: Optional[str]
    time: Optional[float]
    time_wall: Optional[float]


class RunResult(BaseModel):
    class Status:
        OK = "OK"
        TLE = "TLE"
        MLE = "MLE"
        RE = "RE"

    exit_code: int
    status: str
    cpu_time_ms: int
    clock_time_ms: int
    peak_memory_kb: int
    stdout: Optional[str]
    stderr: Optional[str]
