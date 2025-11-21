package io.github.leonfoliveira.forseti.autojudge.adapter.driven.docker.config

import io.github.leonfoliveira.forseti.autojudge.adapter.driven.docker.DockerSubmissionRunnerConfig
import io.github.leonfoliveira.forseti.common.application.util.SkipCoverage
import live.forseti.core.domain.entity.Submission
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
            language = Submission.Language.PYTHON_312,
            image = "forseti-sb-python312:$version",
            createCompileCommand = null,
            createRunCommand = { codeFile, _ ->
                arrayOf("python", codeFile.name)
            },
        )
}
