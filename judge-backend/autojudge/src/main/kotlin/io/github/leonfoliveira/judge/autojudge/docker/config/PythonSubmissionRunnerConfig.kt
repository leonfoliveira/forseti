package io.github.leonfoliveira.judge.autojudge.docker.config

import io.github.leonfoliveira.judge.autojudge.docker.DockerSubmissionRunnerConfig
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.util.SkipCoverage
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@SkipCoverage
class PythonSubmissionRunnerConfig {
    @Bean
    fun python3d13() =
        DockerSubmissionRunnerConfig(
            language = Language.PYTHON_3_13,
            image = "python:3.13-alpine",
            createCompileCommand = null,
            createRunCommand = { codeFile, _ ->
                arrayOf("python", "/app/${codeFile.name}")
            },
        )
}
