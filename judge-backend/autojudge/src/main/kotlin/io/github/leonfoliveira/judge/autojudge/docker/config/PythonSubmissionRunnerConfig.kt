package io.github.leonfoliveira.judge.autojudge.docker.config

import io.github.leonfoliveira.judge.autojudge.docker.DockerSubmissionRunnerConfig
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.util.GeneratedSkipCoverage
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@GeneratedSkipCoverage
class PythonSubmissionRunnerConfig {
    @Bean
    fun python3d13d3(): DockerSubmissionRunnerConfig {
        return DockerSubmissionRunnerConfig(
            language = Language.PYTHON_3_13_3,
            image = "python:3.13.3-alpine",
            createCompileCommand = null,
            createRunCommand = { codeFile ->
                arrayOf("python", "/app/${codeFile.name}")
            },
        )
    }
}
