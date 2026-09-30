class Config:
    def __init__(
        self,
        image: str,
        create_compile_command,
        create_run_command,
    ):
        self.image = image
        self.create_compile_command = create_compile_command
        self.create_run_command = create_run_command


class SubmissionLanguage:
    CPP_17 = "CPP_17"
    JAVA_21 = "JAVA_21"
    PYTHON_312 = "PYTHON_312"
    NODE_22 = "NODE_22"


LANGUAGE_CONFIGS = {
    SubmissionLanguage.CPP_17: Config(
        image="forseti-sb-cpp17",
        create_compile_command=lambda code_filename: [
            "g++",
            "-o",
            "a.out",
            code_filename,
            "-O2",
            "-std=c++17",
            "-DONLINE_JUDGE",
        ],
        create_run_command=lambda _: ["/box/a.out"],
    ),
    SubmissionLanguage.JAVA_21: Config(
        image="forseti-sb-java21",
        create_compile_command=lambda code_filename: ["javac", code_filename],
        create_run_command=lambda code_filename: [
            "/usr/lib/jvm/java-21-openjdk-amd64/bin/java",
            "-XX:-UseContainerSupport",
            "-XX:MaxRAMPercentage=80.0",
            "-XX:+UseSerialGC",
            "-Xss256k",
            "-XX:TieredStopAtLevel=1",
            "-XX:CompressedClassSpaceSize=16m",
            "-XX:MaxMetaspaceSize=64m",
            "-Xshare:off",
            "-cp",
            "/box",
            code_filename.split(".")[0],
        ],
    ),
    SubmissionLanguage.PYTHON_312: Config(
        image="forseti-sb-python312",
        create_compile_command=lambda _: None,
        create_run_command=lambda code_filename: [
            "/usr/bin/python3",
            f"/box/{code_filename}",
        ],
    ),
    SubmissionLanguage.NODE_22: Config(
        image="forseti-sb-node22",
        create_compile_command=lambda _: None,
        create_run_command=lambda code_filename: [
            "/usr/bin/node",
            f"/box/{code_filename}",
        ],
    ),
}
