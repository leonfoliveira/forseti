package com.forsetijudge.core.port.driving.usecase.internal.submission

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Submission
import java.time.OffsetDateTime

interface FindAllSubmissionsByContestSinceLastFreezeInternalUseCase {
    /**
     * Finds all submissions for a given contest since the last freeze time.
     *
     * @return A list of [com.forsetijudge.core.domain.entity.Submission] representing the submissions found.
     */
    fun execute(command: Command): List<Submission>

    data class Command(
        val contest: Contest,
        val frozenAt: OffsetDateTime,
    )
}
