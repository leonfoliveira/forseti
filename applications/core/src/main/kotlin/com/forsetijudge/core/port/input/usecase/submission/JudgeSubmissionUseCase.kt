package com.forsetijudge.core.port.input.usecase.submission

import com.forsetijudge.core.domain.entity.Submission
import java.util.UUID

interface JudgeSubmissionUseCase {
    /**
     * Updates the answer of an existing submission after it has been judged.
     *
     * @param command The command containing the submission ID and the new answer.
     */
    fun execute(command: Command)

    /**
     * Command for updating the answer of a submission after it has been judged.
     *
     * @param submissionId The ID of the submission to be updated.
     * @param answer The new answer to be set for the submission.
     * @param totalTestCases The total number of test cases for the submission.
     * @param approvedTestCases The number of test cases that passed for the submission.
     * @param maxCpuTimeMs The maximum CPU time used during the judging process, if available.
     * @param maxClockTimeMs The maximum clock time used during the judging process, if available.
     * @param maxPeakMemoryKb The maximum peak memory used during the judging process, if available.
     * @param detailsId The ID of the details attachment associated with the submission, if available
     */
    data class Command(
        val submissionId: UUID,
        val answer: Submission.Answer,
        val totalTestCases: Int,
        val approvedTestCases: Int,
        val maxCpuTimeMs: Long?,
        val maxClockTimeMs: Long?,
        val maxPeakMemoryKb: Long?,
        val detailsId: UUID?,
    )
}
