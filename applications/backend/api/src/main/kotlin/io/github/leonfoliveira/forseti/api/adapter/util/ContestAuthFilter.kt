package io.github.leonfoliveira.forseti.api.adapter.util

import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.application.service.contest.FindContestService
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ContestAuthFilter(
    val findContestService: FindContestService,
) {
    /**
     * Checks if the member in the current session belongs to the specified contest.
     * ROOT members bypass this check.
     *
     * @param contestId The ID of the contest to check against.
     * @throws io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException if the member does not belong to the contest and is not a ROOT member.
     */
    fun checkIfMemberBelongsToContest(contestId: UUID) {
        val member =
            RequestContext.Companion
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
    fun checkIfStarted(contestId: UUID) {
        val member =
            RequestContext.Companion
                .getContext()
                .session
                ?.member
        val contest = findContestService.findById(contestId)
        if (!setOf(Member.Type.ROOT, Member.Type.ADMIN).contains(member?.type) && !contest.hasStarted()) {
            throw ForbiddenException("You are not authorized to access this contest before it starts")
        }
    }
}
