package com.forsetijudge.core.port.driving.usecase.external.submission

import java.util.UUID

interface AutoJudgeSubmissionUseCase {
    /**
     * Executes the judge process for a given submission.
     *
     * @param command The command containing the submission ID to be evaluated.
     */
    fun execute(command: Command)

    /**
     * Command for judge a submission.
     *
     * @param submissionId The ID of the submission to be judged.
     */
    data class Command(
        val submissionId: UUID,
    )
}
