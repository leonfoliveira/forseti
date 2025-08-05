package io.github.leonfoliveira.judge.autojudge.docker.config

import io.github.leonfoliveira.judge.autojudge.docker.DockerSubmissionRunnerConfig
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.util.GeneratedSkipCoverage
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@GeneratedSkipCoverage
class JavaSubmissionRunnerConfig {
    @Bean
    fun java21() = DockerSubmissionRunnerConfig(
        language = Language.JAVA_21,
        image = "eclipse-temurin:21-jdk-alpine",
        createCompileCommand = { codeFile  ->
            arrayOf("javac", "-d", "/app", "/app/${codeFile.name}")
        },
        createRunCommand = { codeFile, memoryLimit ->
            arrayOf("java", "-Xmx${memoryLimit}m", "-cp", "/app", codeFile.nameWithoutExtension)
        },
    )
}