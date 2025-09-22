package io.github.leonfoliveira.judge.autojudge.adapter.docker.config

import io.github.leonfoliveira.judge.autojudge.adapter.docker.DockerSubmissionRunnerConfig
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.util.SkipCoverage
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@SkipCoverage
class PythonSubmissionRunnerConfig(
    @Value("\${spring.application.version}")
    private val version: String,
) {
    @Bean
    fun python3d12() =
        DockerSubmissionRunnerConfig(
            language = Language.PYTHON_312,
            image = "judge-sb-python312:$version",
            createCompileCommand = null,
            createRunCommand = { codeFile, _ ->
                arrayOf("python", codeFile.name)
            },
        )
}
