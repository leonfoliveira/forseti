package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driving.usecase.contest.AuthorizeContestUseCase
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class AuthorizeContestService(
    private val contestRepository: ContestRepository,
) : AuthorizeContestUseCase {
    /**
     * Checks if the member in the current session belongs to the specified contest.
     * ROOT members bypass this check.
     *
     * @param contestId The ID of the contest to check against.
     * @throws ForbiddenException if the member does not belong to the contest and is not a ROOT member.
     */
    override fun checkIfMemberBelongsToContest(contestId: UUID) {
        val member =
            RequestContext
                .getContext()
                .session
                ?.member
        if (member?.type != Member.Type.ROOT && member?.contest?.id != contestId) {
            throw ForbiddenException("You are not authorized to access this contest")
        }
    }

    /**
     * Checks if the specified contest has started.
     * ADMIN and ROOT members bypass this check.
     *
     * @param contestId The ID of the contest to check.
     * @throws ForbiddenException if the contest has not started and the member is not an ADMIN or ROOT member.
     */
    override fun checkIfStarted(contestId: UUID) {
        val member =
            RequestContext
                .getContext()
                .session
                ?.member
        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw ForbiddenException("Contest not found")
        if (!setOf(Member.Type.ROOT, Member.Type.ADMIN).contains(member?.type) && !contest.hasStarted()) {
            throw ForbiddenException("You are not authorized to access this contest before it starts")
        }
    }
}
