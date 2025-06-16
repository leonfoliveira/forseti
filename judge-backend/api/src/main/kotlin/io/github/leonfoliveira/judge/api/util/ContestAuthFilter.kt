package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.core.service.problem.FindProblemService
import io.github.leonfoliveira.judge.core.service.submission.FindSubmissionService
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ContestAuthFilter(
    val findProblemService: FindProblemService,
    val findSubmissionService: FindSubmissionService,
) {
    fun check(contestId: UUID) {
        val authorization = AuthorizationContextUtil.getAuthorization()
        if (authorization.contestId != contestId) {
            throw ForbiddenException("You are not authorized to access this contest")
        }
    }

    fun checkFromProblem(problemId: UUID) {
        val authorization = AuthorizationContextUtil.getAuthorization()
        val problem = findProblemService.findById(problemId)
        if (authorization.contestId != problem.contest.id) {
            throw ForbiddenException("You are not authorized to access this contest")
        }
    }

    fun checkFromSubmission(submissionId: UUID) {
        val authorization = AuthorizationContextUtil.getAuthorization()
        val submission = findSubmissionService.findById(submissionId)
        if (authorization.contestId != submission.contest.id) {
            throw ForbiddenException("You are not authorized to access this contest")
        }
    }
}
