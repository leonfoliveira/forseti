package io.github.leonfoliveira.forseti.api.application.port.driven

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission

interface SubmissionEmitter {
    /**
     * Emits a submission to the appropriate channels.
     *
     * @param submission The submission to be emitted.
     */
    fun emit(submission: Submission)
}
