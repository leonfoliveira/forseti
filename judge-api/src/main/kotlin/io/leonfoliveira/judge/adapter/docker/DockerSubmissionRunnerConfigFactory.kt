package io.leonfoliveira.judge.adapter.docker

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import org.springframework.stereotype.Component

@Component
class DockerSubmissionRunnerConfigFactory(
    configs: List<DockerSubmissionRunnerConfig>,
) {
    val configs = configs.associateBy { it.language }

    fun get(language: Language): DockerSubmissionRunnerConfig {
        return configs[language]
            ?: throw BusinessException("No DockerSubmissionRunnerConfig found for language: $language")
    }
}

