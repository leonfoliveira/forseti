package io.github.leonfoliveira.judge.adapter.docker

import io.github.leonfoliveira.judge.core.domain.enumerate.Language
import java.io.File

data class DockerSubmissionRunnerConfig(
    val language: Language,
    val image: String,
    val createCompileCommand: ((File) -> Array<String>)?,
    val createRunCommand: (File) -> Array<String>,
)
