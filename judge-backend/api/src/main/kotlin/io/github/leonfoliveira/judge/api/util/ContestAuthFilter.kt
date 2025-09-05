package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.service.contest.FindContestService
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ContestAuthFilter(
    val findContestService: FindContestService,
) {
    fun checkIfMemberBelongsToContest(contestId: UUID) {
        val member = AuthorizationContextUtil.getMember()
        if (member?.type != Member.Type.ROOT && member?.contestId != contestId) {
            throw ForbiddenException("You are not authorized to access this contest")
        }
    }

    fun checkIfStarted(contestId: UUID) {
        val member = AuthorizationContextUtil.getMember()
        val contest = findContestService.findById(contestId)
        if (!setOf(Member.Type.ROOT, Member.Type.ADMIN).contains(member?.type) && !contest.hasStarted()) {
            throw ForbiddenException("You are not authorized to access this contest before it starts")
        }
    }
}
