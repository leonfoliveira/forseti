package io.github.leonfoliveira.forseti.autojudge.adapter.driven.docker

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import java.io.File

/**
 * Configuration for running a submission in a Docker container
 *
 * @param language The programming language of the configuration
 * @param image The Docker image to use
 * @param createCompileCommand Function to create the compile command, or null if no compilation is needed
 * @param createRunCommand Function to create the run command
 */
data class DockerSubmissionRunnerConfig(
    val language: Submission.Language,
    val image: String,
    val createCompileCommand: ((File) -> Array<String>)?,
    val createRunCommand: (File, Int) -> Array<String>,
)
