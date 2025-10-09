package io.github.leonfoliveira.judge.autojudge.adapter.docker

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import org.springframework.stereotype.Component

@Component
class DockerSubmissionRunnerConfigFactory(
    configs: List<DockerSubmissionRunnerConfig>,
) {
    private val configs = configs.associateBy { it.language }

    fun get(language: Submission.Language): DockerSubmissionRunnerConfig = configs[language]!!
}
