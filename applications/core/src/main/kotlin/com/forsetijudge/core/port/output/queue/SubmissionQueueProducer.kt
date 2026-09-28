package com.forsetijudge.core.port.output.queue

import com.forsetijudge.core.domain.entity.Submission
import java.util.UUID

interface SubmissionQueueProducer {
    /**
     * Produces a message to be sent to the submission queue.
     *
     * @param message The message to be sent to the submission queue.
     */
    fun produce(message: Message)

    /**
     * Represents a message to be sent to the submission queue.
     *
     * @param contestId The ID of the contest to which the submission belongs.
     * @param submissionId The ID of the submission.
     * @param language The programming language used for the submission.
     * @param codeId The ID of the code attachment.
     * @param timeLimitMs The time limit for the submission in milliseconds.
     * @param memoryLimitMb The memory limit for the submission in megabytes.
     * @param testCasesId The ID of the test cases attachment.
     */
    data class Message(
        val contestId: UUID,
        val submissionId: UUID,
        val language: Submission.Language,
        val codeId: UUID,
        val timeLimitMs: Int,
        val memoryLimitMb: Int,
        val testCasesId: UUID,
    )
}
