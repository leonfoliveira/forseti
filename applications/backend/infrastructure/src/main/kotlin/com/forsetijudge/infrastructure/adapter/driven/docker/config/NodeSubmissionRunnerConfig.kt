package com.forsetijudge.infrastructure.adapter.driven.docker.config

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.infrastructure.adapter.driven.docker.DockerSubmissionRunnerConfig
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class NodeSubmissionRunnerConfig(
    @Value("\${spring.application.version}")
    private val version: String,
) {
    @Bean
    fun node22() =
        DockerSubmissionRunnerConfig(
            language = Submission.Language.NODE_22,
            image = "forseti-sb-node22:$version",
            createCompileCommand = null,
            createRunCommand = { codeFile, _ ->
                arrayOf("node", codeFile.name)
            },
        )
}
