package com.forsetijudge.infrastructure.adapter.driven.docker.config

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.infrastructure.adapter.driven.docker.DockerSubmissionRunnerConfig
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class CppSubmissionRunnerConfig(
    @Value("\${spring.application.version}")
    private val version: String,
) {
    @Bean
    fun cpp17() =
        DockerSubmissionRunnerConfig(
            language = Submission.Language.CPP_17,
            image = "forseti-sb-cpp17:$version",
            createCompileCommand = { codeFile ->
                arrayOf("g++", "-o", "a.out", codeFile.name, "-O2", "-std=c++17", "-DONLINE_JUDGE")
            },
            createRunCommand = { _, _ -> arrayOf("./a.out") },
        )
}
