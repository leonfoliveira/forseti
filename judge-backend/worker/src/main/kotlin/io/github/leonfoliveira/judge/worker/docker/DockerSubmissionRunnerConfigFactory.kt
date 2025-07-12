package io.github.leonfoliveira.judge.worker.docker

import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import org.springframework.stereotype.Component

@Component
class DockerSubmissionRunnerConfigFactory(
    configs: List<DockerSubmissionRunnerConfig>,
) {
    private val configs = configs.associateBy { it.language }

    fun get(language: Language): DockerSubmissionRunnerConfig {
        return configs[language]!!
    }
}
