package com.forsetijudge.core.port.driving.usecase.external.submission

import com.forsetijudge.core.domain.entity.Submission

interface FindAllSubmissionsByContestSinceLastFreezeUseCase {
    /**
     * Finds all submissions for a given contest since the last freeze time.
     *
     * @return A list of [Submission] representing the submissions found.
     */
    fun execute(): List<Submission>
}
