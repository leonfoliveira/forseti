package io.github.leonfoliveira.forseti.autojudge.adapter.docker

import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import org.springframework.stereotype.Component

@Component
class DockerSubmissionRunnerConfigFactory(
    configs: List<DockerSubmissionRunnerConfig>,
) {
    private val configs = configs.associateBy { it.language }

    fun get(language: Submission.Language): DockerSubmissionRunnerConfig = configs[language]!!
}
