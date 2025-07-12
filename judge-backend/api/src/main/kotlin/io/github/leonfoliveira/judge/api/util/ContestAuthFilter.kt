package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.service.problem.FindProblemService
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ContestAuthFilter(
    val findProblemService: FindProblemService,
    val findSubmissionService: FindSubmissionService,
) {
    fun check(contestId: UUID) {
        val member = AuthorizationContextUtil.getMember()
        if (member.contestId != contestId) {
            throw ForbiddenException("You are not authorized to access this contest")
        }
    }

    fun checkFromProblem(problemId: UUID) {
        val member = AuthorizationContextUtil.getMember()
        val problem = findProblemService.findById(problemId)
        if (member.contestId != problem.contest.id) {
            throw ForbiddenException("You are not authorized to access this contest")
        }
    }

    fun checkFromSubmission(submissionId: UUID) {
        val member = AuthorizationContextUtil.getMember()
        val submission = findSubmissionService.findById(submissionId)
        if (member.contestId != submission.contest.id) {
            throw ForbiddenException("You are not authorized to access this contest")
        }
    }
}
