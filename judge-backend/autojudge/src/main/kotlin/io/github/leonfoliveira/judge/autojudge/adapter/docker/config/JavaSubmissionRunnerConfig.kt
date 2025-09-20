package io.github.leonfoliveira.judge.autojudge.adapter.docker.config

import io.github.leonfoliveira.judge.autojudge.adapter.docker.DockerSubmissionRunnerConfig
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.util.SkipCoverage
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
            language = Language.JAVA_21,
            image = "judge-sb-java21:$version",
            createCompileCommand = { codeFile ->
                arrayOf("javac", "-d", ".", codeFile.name)
            },
            createRunCommand = { codeFile, memoryLimit ->
                arrayOf("java", "-Xmx${memoryLimit}m", "-cp", ".", codeFile.nameWithoutExtension)
            },
        )
}
