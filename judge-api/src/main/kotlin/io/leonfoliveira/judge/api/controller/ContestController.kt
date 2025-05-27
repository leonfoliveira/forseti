package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.controller.dto.response.ContestPrivateResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.ContestSummaryResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.ContestPublicResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.ProblemPublicResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.ProblemWithStatusResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.SubmissionPublicResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.toPrivateResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.toPublicResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.toResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.toSummaryResponseDTO
import io.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.leonfoliveira.judge.api.util.Private
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.service.contest.CreateContestService
import io.leonfoliveira.judge.core.service.contest.DeleteContestService
import io.leonfoliveira.judge.core.service.contest.FindContestService
import io.leonfoliveira.judge.core.service.contest.UpdateContestService
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTO
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTO
import io.leonfoliveira.judge.core.service.dto.output.LeaderboardOutputDTO
import io.leonfoliveira.judge.core.service.leaderboard.LeaderboardService
import io.leonfoliveira.judge.core.service.problem.FindProblemService
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
import jakarta.transaction.Transactional
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/contests")
class ContestController(
    private val createContestService: CreateContestService,
    private val updateContestService: UpdateContestService,
    private val findContestService: FindContestService,
    private val deleteContestService: DeleteContestService,
    private val leaderboardService: LeaderboardService,
    private val findProblemService: FindProblemService,
    private val findSubmissionService: FindSubmissionService,
) {
    @PostMapping
    @Private(Member.Type.ROOT)
    @Transactional
    fun createContest(
        @RequestBody body: CreateContestInputDTO,
    ): ResponseEntity<ContestPrivateResponseDTO> {
        val authentication = AuthorizationContextUtil.getAuthorization()
        if (authentication.type != Member.Type.ROOT) {
            throw ForbiddenException()
        }
        val contest = createContestService.create(body)
        return ResponseEntity.ok(contest.toPrivateResponseDTO())
    }

    @PutMapping
    @Private(Member.Type.ROOT)
    @Transactional
    fun updateContest(
        @RequestBody body: UpdateContestInputDTO,
    ): ResponseEntity<ContestPrivateResponseDTO> {
        val contest = updateContestService.update(body)
        return ResponseEntity.ok(contest.toPrivateResponseDTO())
    }

    @GetMapping
    @Private(Member.Type.ROOT)
    fun findAllContest(): ResponseEntity<List<ContestSummaryResponseDTO>> {
        val contests = findContestService.findAll()
        return ResponseEntity.ok(contests.map { it.toSummaryResponseDTO() })
    }

    @GetMapping("/{id}/root")
    @Private(Member.Type.ROOT)
    fun findContestByIdForRoot(
        @PathVariable id: Int,
    ): ResponseEntity<ContestPrivateResponseDTO> {
        val contest = findContestService.findById(id)
        return ResponseEntity.ok(contest.toPrivateResponseDTO())
    }

    @GetMapping("/{id}")
    fun findContestById(
        @PathVariable id: Int,
    ): ResponseEntity<ContestPublicResponseDTO> {
        val contest = findContestService.findById(id)
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }
        return ResponseEntity.ok(contest.toPublicResponseDTO())
    }

    @GetMapping("/{id}/summary")
    fun findContestSummaryById(
        @PathVariable id: Int,
    ): ResponseEntity<ContestSummaryResponseDTO> {
        val contest = findContestService.findById(id)
        return ResponseEntity.ok(contest.toSummaryResponseDTO())
    }

    @DeleteMapping("/{id}")
    @Private(Member.Type.ROOT)
    @Transactional
    fun deleteContest(
        @PathVariable id: Int,
    ): ResponseEntity<Void> {
        deleteContestService.delete(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/leaderboard")
    fun getLeaderboard(
        @PathVariable id: Int,
    ): ResponseEntity<LeaderboardOutputDTO> {
        val leaderboard = leaderboardService.buildLeaderboard(id)
        return ResponseEntity.ok(leaderboard)
    }

    @GetMapping("/{id}/problems")
    fun findAllProblems(
        @PathVariable id: Int,
    ): ResponseEntity<List<ProblemPublicResponseDTO>> {
        val problems = findProblemService.findAllByContest(id)
        return ResponseEntity.ok(problems.map { it.toPublicResponseDTO() })
    }

    @GetMapping("/{id}/problems/me")
    @Private(Member.Type.CONTESTANT)
    fun findAllProblemsForMember(
        @PathVariable id: Int,
    ): ResponseEntity<List<ProblemWithStatusResponseDTO>> {
        val authorization = AuthorizationContextUtil.getAuthorization()
        val problems = findProblemService.findAllByContestForMember(id, authorization.id)
        return ResponseEntity.ok(problems.map { it.toResponseDTO() })
    }

    @GetMapping("/{id}/submissions")
    fun findAllSubmissions(
        @PathVariable id: Int,
    ): ResponseEntity<List<SubmissionPublicResponseDTO>> {
        val submissions = findSubmissionService.findAllByContest(id)
        return ResponseEntity.ok(submissions.map { it.toPublicResponseDTO() })
    }
}
