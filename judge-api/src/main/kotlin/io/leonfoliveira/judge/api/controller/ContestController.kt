package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.config.JwtAuthentication
import io.leonfoliveira.judge.api.dto.request.CreateContestRequestDTO
import io.leonfoliveira.judge.api.dto.request.UpdateContestRequestDTO
import io.leonfoliveira.judge.api.dto.response.ContestFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.ContestResponseDTO
import io.leonfoliveira.judge.api.dto.response.ProblemResponseDTO
import io.leonfoliveira.judge.api.dto.response.SubmissionResponseDTO
import io.leonfoliveira.judge.api.dto.response.toFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.toResponseDTO
import io.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.leonfoliveira.judge.api.util.Private
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.service.contest.CreateContestService
import io.leonfoliveira.judge.core.service.contest.DeleteContestService
import io.leonfoliveira.judge.core.service.contest.FindContestService
import io.leonfoliveira.judge.core.service.contest.UpdateContestService
import io.leonfoliveira.judge.core.service.dto.output.LeaderboardOutputDTO
import io.leonfoliveira.judge.core.service.dto.output.ProblemMemberOutputDTO
import io.leonfoliveira.judge.core.service.leaderboard.LeaderboardService
import io.leonfoliveira.judge.core.service.problem.FindProblemService
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
import jakarta.transaction.Transactional
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
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
        @RequestBody input: CreateContestRequestDTO,
    ): ResponseEntity<ContestFullResponseDTO> {
        val authentication = SecurityContextHolder.getContext().authentication as JwtAuthentication
        if (authentication.principal?.type != Member.Type.ROOT) {
            throw ForbiddenException()
        }
        val contest = createContestService.create(input.toInputDTO())
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @PutMapping
    @Private(Member.Type.ROOT)
    @Transactional
    fun updateContest(
        @RequestBody input: UpdateContestRequestDTO,
    ): ResponseEntity<ContestFullResponseDTO> {
        val contest = updateContestService.update(input.toInputDTO())
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @GetMapping
    @Private(Member.Type.ROOT)
    fun findAllContest(): ResponseEntity<List<ContestResponseDTO>> {
        val contests = findContestService.findAll()
        return ResponseEntity.ok(contests.map { it.toResponseDTO() })
    }

    @GetMapping("/{id}/full")
    @Private(Member.Type.ROOT)
    fun findFullContestById(
        @PathVariable id: Int,
    ): ResponseEntity<ContestFullResponseDTO> {
        val contest = findContestService.findById(id)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @GetMapping("/{id}")
    fun findContestById(
        @PathVariable id: Int,
    ): ResponseEntity<ContestResponseDTO> {
        val contest = findContestService.findById(id)
        return ResponseEntity.ok(contest.toResponseDTO())
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
    fun leaderboard(
        @PathVariable id: Int,
    ): ResponseEntity<LeaderboardOutputDTO> {
        val leaderboard = leaderboardService.buildLeaderboard(id)
        return ResponseEntity.ok(leaderboard)
    }

    @GetMapping("/{id}/problems")
    fun findAllProblems(
        @PathVariable id: Int,
    ): ResponseEntity<List<ProblemResponseDTO>> {
        val problems = findProblemService.findAllByContest(id)
        return ResponseEntity.ok(problems.map { it.toResponseDTO() })
    }

    @GetMapping("/{id}/problems/me")
    @Private(Member.Type.CONTESTANT)
    fun findAllProblemsForMember(
        @PathVariable id: Int,
    ): ResponseEntity<List<ProblemMemberOutputDTO>> {
        val authentication = AuthorizationContextUtil.getAuthorization()
        val problems = findProblemService.findAllByContestForMember(id, authentication.id)
        return ResponseEntity.ok(problems)
    }

    @GetMapping("/{id}/submissions")
    fun findAllSubmissions(
        @PathVariable id: Int,
    ): ResponseEntity<List<SubmissionResponseDTO>> {
        val submissions = findSubmissionService.findAllByContest(id)
        return ResponseEntity.ok(submissions.map { it.toResponseDTO() })
    }
}
