package io.github.leonfoliveira.forseti.api.util

import io.github.leonfoliveira.forseti.common.domain.entity.Member
import io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.service.contest.FindContestService
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ContestAuthFilter(
    val findContestService: FindContestService,
) {
    fun checkIfMemberBelongsToContest(contestId: UUID) {
        val member = RequestContext.getContext().session?.member
        if (member?.type != Member.Type.ROOT && member?.contest?.id != contestId) {
            throw ForbiddenException("You are not authorized to access this contest")
        }
    }

    fun checkIfStarted(contestId: UUID) {
        val member = RequestContext.getContext().session?.member
        val contest = findContestService.findById(contestId)
        if (!setOf(Member.Type.ROOT, Member.Type.ADMIN).contains(member?.type) && !contest.hasStarted()) {
            throw ForbiddenException("You are not authorized to access this contest before it starts")
        }
    }
}
