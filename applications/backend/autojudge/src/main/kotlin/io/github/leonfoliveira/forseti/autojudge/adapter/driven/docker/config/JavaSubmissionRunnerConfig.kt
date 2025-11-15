package io.github.leonfoliveira.forseti.autojudge.adapter.driven.docker.config

import io.github.leonfoliveira.forseti.autojudge.adapter.driven.docker.DockerSubmissionRunnerConfig
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.util.SkipCoverage
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@SkipCoverage
class JavaSubmissionRunnerConfig(
    @Value("\${spring.application.version}")
    private val version: String,
) {
    @Bean
    fun java21() =
        DockerSubmissionRunnerConfig(
            language = Submission.Language.JAVA_21,
            image = "forseti-sb-java21:$version",
            createCompileCommand = { codeFile ->
                arrayOf("javac", "-d", ".", codeFile.name)
            },
            createRunCommand = { codeFile, memoryLimit ->
                arrayOf("java", "-Xmx${memoryLimit}m", "-cp", ".", codeFile.nameWithoutExtension)
            },
        )
}
