package io.github.leonfoliveira.judge.autojudge.docker

import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import java.io.File

data class DockerSubmissionRunnerConfig(
    val language: Language,
    val image: String,
    val createCompileCommand: ((File) -> Array<String>)?,
    val createRunCommand: (File) -> Array<String>,
)
