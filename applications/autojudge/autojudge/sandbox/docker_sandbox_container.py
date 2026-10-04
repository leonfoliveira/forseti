import io
import logging
import os
import socket
import tarfile
import time

from docker.types import Ulimit

from autojudge.config.docker_config import docker_client
from autojudge.config.env import env
from autojudge.sandbox.language_config import LANGUAGE_CONFIGS
from autojudge.sandbox.models import IsolateMeta, RunResult
from autojudge.schema.submission_schema import SubmissionSchema
from autojudge.util.parse_util import _to_float_or_none, _to_int_or_none

logger = logging.getLogger(__name__)


class DockerSandboxContainer:
    """Create and manage Docker containers for code submissions."""

    CONTAINER_MEMORY_OVERHEAD_MB = 512

    def __init__(self, submission: SubmissionSchema, code_file_path: os.PathLike):
        """Create a sandbox for the submission and its source file."""

        self.submission = submission
        self.code_file_path = code_file_path
        self.config = LANGUAGE_CONFIGS[submission.language]
        container_memory_limit_mb = (
            submission.memory_limit_mb + self.CONTAINER_MEMORY_OVERHEAD_MB
        )

        self.container = docker_client.containers.create(
            image=f"{self.config.image}:{env.version}",
            name=f"{self.config.image}.{int(time.time())}",
            command=["sleep", "infinity"],
            detach=True,
            # Automatically remove container on exit
            auto_remove=True,
            # Network isolation
            network_mode="none",
            # Block additional privileges
            security_opt=["no-new-privileges:true"],
            # Deny access to all devices
            device_cgroup_rules=["c *:* m"],
            # Limit process IDs
            pids_limit=64,
            # Limit CPU cores
            nano_cpus=1_000_000_000,
            # Limit memory
            mem_limit=f"{container_memory_limit_mb}m",
            # Limit memory swap
            memswap_limit=f"{container_memory_limit_mb}m",
            # Resource limit configurations
            ulimits=[
                Ulimit(name="fsize", soft=10485760, hard=10485760),
                Ulimit(name="nofile", soft=64, hard=64),
                Ulimit(name="nproc", soft=64, hard=64),
                Ulimit(name="core", soft=0, hard=0),
            ],
            # Run in privileged mode to allow Isolate to set up namespaces and cgroups
            privileged=True,
        )

        logger.info(
            f"Container created for submission: {self.submission.submission_id}"
        )

    def start(self):
        """Start the Docker container and initialize the isolate environment."""

        logger.info(
            f"Starting container for submission: {self.submission.submission_id}"
        )

        self.container.start()
        self.container.exec_run(cmd=["isolate", "--init"])
        self._copy(
            src_path=self.code_file_path,
            dest_path="/var/local/lib/isolate/0/box",
            filename=self.submission.code_filename,
        )

        logger.info(
            f"Container started for submission: {self.submission.submission_id}"
        )

    def compile(self):
        """Compile the submission when its language requires it."""

        compile_command = (
            self.config.create_compile_command(self.submission.code_filename)
            if self.config.create_compile_command is not None
            else None
        )
        if compile_command is None:
            logger.info(
                "No compile command for submission: %s, skipping compilation.",
                self.submission.submission_id,
            )
            return
        logger.info(f"Compiling submission: {self.submission.submission_id}")
        self._exec(cmd=compile_command)
        logger.info(
            f"Compilation finished for submission: {self.submission.submission_id}"
        )

    def run(self, stdin: str) -> RunResult:
        """Run the submission with the provided input and return its result."""

        logger.info(f"Running code for submission: {self.submission.submission_id}")
        isolate_command = [
            "isolate",
            "--box-id=0",
            "--silent",
            "--processes=64",
            f"--time={self.submission.time_limit_ms / 1000}",
            f"--wall-time={self.submission.time_limit_ms / 1000 + 1}",
            f"--mem={self.submission.memory_limit_mb * 1024}",
            "--meta=/tmp/meta",
            "--run",
            "--",
        ]
        run_command = self.config.create_run_command(self.submission.code_filename)
        cmd = isolate_command + run_command

        stdout = None
        stderr = None
        try:
            stdout = self._exec(cmd, stdin=stdin)
        except Exception as e:
            stderr = str(e)

        raw_metadata = self._exec(["cat", "/tmp/meta"])
        metadata = {}
        for line in raw_metadata.splitlines():
            if not line.strip():
                continue
            parts = line.split(":", 1)
            if len(parts) != 2:
                continue
            metadata[parts[0].strip()] = parts[1].strip()

        logger.info(
            "Execution completed. stdout: %s. stderr: %s. meta: %s",
            (stdout or "")[:100],
            (stderr or "")[:100],
            metadata,
        )

        meta = IsolateMeta(
            exit_code=_to_int_or_none(metadata.get("exitcode")),
            max_rss=_to_int_or_none(metadata.get("max-rss")) or 0,
            status=metadata.get("status"),
            time=_to_float_or_none(metadata.get("time")) or 0.0,
            time_wall=_to_float_or_none(metadata.get("time-wall")) or 0.0,
        )

        return RunResult(
            exit_code=meta.exit_code or 0,
            status=self._parse_status(meta, stderr),
            cpu_time_ms=int((meta.time or 0) * 1000),
            clock_time_ms=int((meta.time_wall or 0) * 1000),
            peak_memory_kb=meta.max_rss or 0,
            stdout=stdout,
            stderr=stderr,
        )

    def kill(self):
        """Forcefully remove the Docker container associated with this submission."""

        self.container.remove(force=True)

    def _copy(self, src_path: os.PathLike, dest_path: str, filename: str):
        """Copy a file or directory from the host to the Docker container."""

        stream = io.BytesIO()
        with tarfile.open(fileobj=stream, mode="w") as tar:
            tar.add(src_path, arcname=filename)
        stream.seek(0)
        self.container.put_archive(path=dest_path, data=stream.read())

    def _exec(self, cmd: list[str], stdin: str | None = None) -> str:
        """Execute a container command and return its standard output."""

        api = docker_client.api
        exec_id = api.exec_create(
            self.container.id,
            cmd,
            stdin=stdin is not None,
            stdout=True,
            stderr=True,
            workdir="/var/local/lib/isolate/0/box",
        )["Id"]

        sock = api.exec_start(exec_id, socket=True)
        raw_sock = sock._sock
        if stdin is not None:
            raw_sock.sendall(stdin.encode())
        raw_sock.shutdown(socket.SHUT_WR)

        raw_output = b""
        while True:
            chunk = raw_sock.recv(4096)
            if not chunk:
                break
            raw_output += chunk
        sock.close()

        stdout_bytes, stderr_bytes = self._demux(raw_output)
        exit_code = api.exec_inspect(exec_id)["ExitCode"]

        stdout = stdout_bytes.decode(errors="replace")
        stderr = stderr_bytes.decode(errors="replace")
        if exit_code != 0:
            raise Exception(stderr)
        return stdout

    def _demux(self, raw_output: bytes) -> tuple[bytes, bytes]:
        """Split Docker's multiplexed output into stdout and stderr."""

        stdout = bytearray()
        stderr = bytearray()
        offset = 0
        while offset + 8 <= len(raw_output):
            stream_type = raw_output[offset]
            size = int.from_bytes(raw_output[offset + 4 : offset + 8], "big")
            start = offset + 8
            end = start + size
            payload = raw_output[start:end]
            if stream_type == 2:
                stderr.extend(payload)
            else:
                stdout.extend(payload)
            offset = end
        return bytes(stdout), bytes(stderr)

    def _parse_status(
        self,
        isolate_meta: IsolateMeta,
        stderr: str | None,
    ) -> RunResult.Status:
        """Map Isolate's metadata and stderr to a result status."""

        if isolate_meta.status == IsolateMeta.Status.XX:
            raise RuntimeError(f"Sandbox internal error: {isolate_meta}")

        if isolate_meta.status is not None:
            if (isolate_meta.max_rss or 0) > self.submission.memory_limit_mb * 1024:
                return RunResult.Status.MLE

            mle_patterns = [
                "std::bad_alloc",
                "java.lang.OutOfMemoryError",
                "node::OOMErrorHandler",
                "MemoryError",
            ]
            if any(pattern in (stderr or "") for pattern in mle_patterns):
                return RunResult.Status.MLE

            if isolate_meta.status == IsolateMeta.Status.TO:
                return RunResult.Status.TLE

            return RunResult.Status.RE

        return RunResult.Status.OK
