package io.github.leonfoliveira.judge.autojudge.docker.config

import io.github.leonfoliveira.judge.autojudge.docker.DockerSubmissionRunnerConfig
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.util.SkipCoverage
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@SkipCoverage
class CppSubmissionRunnerConfig {
    @Bean
    fun cpp17() =
        DockerSubmissionRunnerConfig(
            language = Language.CPP_17,
            image = "gcc:15.1.0",
            createCompileCommand = { codeFile ->
                arrayOf("g++", "-o", "/app/a.out", "/app/${codeFile.name}", "-O2", "-std=c++17", "-DONLINE_JUDGE")
            },
            createRunCommand = { _, _ -> arrayOf("/app/a.out") },
        )
}
