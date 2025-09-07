package io.github.leonfoliveira.judge.autojudge.docker.config

import io.github.leonfoliveira.judge.autojudge.docker.DockerSubmissionRunnerConfig
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.util.SkipCoverage
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@SkipCoverage
class CppSubmissionRunnerConfig(
    @Value("\${spring.application.version}")
    private val version: String,
) {
    @Bean
    fun cpp17() =
        DockerSubmissionRunnerConfig(
            language = Language.CPP_17,
            image = "judge-sb-cpp17:$version",
            createCompileCommand = { codeFile ->
                arrayOf("g++", "-o", "a.out", codeFile.name, "-O2", "-std=c++17", "-DONLINE_JUDGE")
            },
            createRunCommand = { _, _ -> arrayOf("./a.out") },
        )
}
