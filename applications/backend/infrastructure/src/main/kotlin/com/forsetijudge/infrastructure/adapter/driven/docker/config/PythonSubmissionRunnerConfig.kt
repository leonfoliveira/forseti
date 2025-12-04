package com.forsetijudge.infrastructure.adapter.driven.docker.config

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.infrastructure.adapter.driven.docker.DockerSubmissionRunnerConfig
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class PythonSubmissionRunnerConfig(
    @Value("\${spring.application.version}")
    private val version: String,
) {
    @Bean
    fun python3d12() =
        DockerSubmissionRunnerConfig(
            language = Submission.Language.PYTHON_312,
            image = "forseti-sb-python312:$version",
            createCompileCommand = null,
            createRunCommand = { codeFile, _ ->
                arrayOf("python", codeFile.name)
            },
        )
}
