package io.github.leonfoliveira.forseti.autojudge.adapter.driven.docker

import live.forseti.core.domain.entity.Submission
import org.springframework.stereotype.Component

@Component
class DockerSubmissionRunnerConfigFactory(
    configs: List<DockerSubmissionRunnerConfig>,
) {
    private val configs = configs.associateBy { it.language }

    /**
     * Get a configuration for the given programming language.
     *
     * @param language The programming language
     * @return The Docker submission runner configuration
     */
    fun get(language: Submission.Language): DockerSubmissionRunnerConfig = configs[language]!!
}
