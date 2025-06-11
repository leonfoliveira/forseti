package io.leonfoliveira.judge.adapter.docker

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import java.io.File
import org.springframework.stereotype.Component

data class DockerSubmissionRunnerConfig(
    val language: Language,
    val image: String,
    val createCompileCommand: ((File) -> Array<String>)?,
    val createRunCommand: (File) -> Array<String>,
)
