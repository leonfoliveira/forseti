package io.github.leonfoliveira.judge.adapter.docker.config

import io.github.leonfoliveira.judge.adapter.docker.DockerSubmissionRunnerConfig
import io.github.leonfoliveira.judge.core.domain.enumerate.Language
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
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
