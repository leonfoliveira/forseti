package com.forsetijudge.core.port.driving.usecase.submission

import com.forsetijudge.core.domain.entity.Submission
import java.util.UUID

interface FindSubmissionUseCase {
    /**
     * Finds a submission by its ID.
     *
     * @param submissionId The ID of the submission to find.
     * @return The submission entity.
     * @throws NotFoundException if the submission is not found.
     */
    fun findById(submissionId: UUID): Submission

    /**
     * Finds all submissions for a specific contest.
     *
     * @param contestId The ID of the contest.
     * @param memberId The ID of the member requesting the submissions.
     * @return A list of submissions for the contest.
     */
    fun findAllByContest(
        contestId: UUID,
        memberId: UUID?,
    ): List<Submission>

    /**
     * Finds all submissions by a specific member.
     *
     * @param memberId The ID of the member.
     * @return A list of submissions by the member.
     */
    fun findAllByMember(memberId: UUID): List<Submission>
}
