package io.github.leonfoliveira.judge.autojudge.adapter.docker

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import java.io.File

data class DockerSubmissionRunnerConfig(
    val language: Submission.Language,
    val image: String,
    val createCompileCommand: ((File) -> Array<String>)?,
    val createRunCommand: (File, Int) -> Array<String>,
)
