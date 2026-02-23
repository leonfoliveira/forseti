package com.forsetijudge.core.port.driving.usecase.internal.execution

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission

interface CreateExecutionInternalUseCase {
    /**
     * Creates a new execution based on the provided input data.
     *
     * @param command The input data transfer object containing submission and execution details.
     * @return The created Execution entity.
     */
    fun execute(command: Command): Execution

    /**
     * Command for creating a new execution.
     *
     * @param contest The contest to which the execution belongs.
     * @param member The member responsible for the execution.
     * @param submission The submission for which the execution is being created.
     * @param answer The answer associated with the submission.
     * @param totalTestCases The total number of test cases for the submission.
     * @param approvedTestCases The number of test cases approved so far.
     * @param input The input attachment for the execution.
     * @param output The list of output strings resulting from the execution.
     */
    data class Command(
        val contest: Contest,
        val member: Member,
        val submission: Submission,
        val answer: Submission.Answer,
        val totalTestCases: Int,
        val approvedTestCases: Int,
        val input: Attachment,
        val output: List<String>,
    )
}
