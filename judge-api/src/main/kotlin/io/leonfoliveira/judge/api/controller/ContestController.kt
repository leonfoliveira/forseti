package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.dto.response.contest.ContestFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.contest.ContestMetadataResponseDTO
import io.leonfoliveira.judge.api.dto.response.contest.ContestPublicOutputDTO
import io.leonfoliveira.judge.api.dto.response.contest.toFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.contest.toMetadataDTO
import io.leonfoliveira.judge.api.dto.response.contest.toPublicOutputDTO
import io.leonfoliveira.judge.api.dto.response.submission.SubmissionFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.submission.SubmissionPublicResponseDTO
import io.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.submission.toPublicResponseDTO
import io.leonfoliveira.judge.api.util.Private
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.service.contest.CreateContestService
import io.leonfoliveira.judge.core.service.contest.DeleteContestService
import io.leonfoliveira.judge.core.service.contest.FindContestService
import io.leonfoliveira.judge.core.service.contest.UpdateContestService
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTO
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTO
import io.leonfoliveira.judge.core.service.dto.output.ContestLeaderboardOutputDTO
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/contests")
class ContestController(
    private val createContestService: CreateContestService,
    private val updateContestService: UpdateContestService,
    private val findContestService: FindContestService,
    private val deleteContestService: DeleteContestService,
    private val findSubmissionService: FindSubmissionService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping
    @Private(Member.Type.ROOT)
    @Transactional
    fun createContest(
        @RequestBody body: CreateContestInputDTO,
    ): ResponseEntity<ContestFullResponseDTO> {
        logger.info("[POST] /v1/contests - body: $body")
        val contest = createContestService.create(body)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @PutMapping
    @Private(Member.Type.ROOT)
    @Transactional
    fun updateContest(
        @RequestBody body: UpdateContestInputDTO,
    ): ResponseEntity<ContestFullResponseDTO> {
        logger.info("[PUT] /v1/contests - body: $body")
        val contest = updateContestService.update(body)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @GetMapping("/metadata")
    @Private(Member.Type.ROOT)
    fun findAllContestMetadata(): ResponseEntity<List<ContestMetadataResponseDTO>> {
        logger.info("[GET] /v1/contests/metadata")
        val contests = findContestService.findAll()
        return ResponseEntity.ok(contests.map { it.toMetadataDTO() })
    }

    @GetMapping("/slug/{slug}/metadata")
    fun findContestMetadataBySlug(
        @PathVariable slug: String,
    ): ResponseEntity<ContestMetadataResponseDTO> {
        logger.info("[GET] /v1/contests/slug/{slug}/metadata - slug: $slug")
        val contest = findContestService.findBySlug(slug)
        return ResponseEntity.ok(contest.toMetadataDTO())
    }

    @GetMapping("/{id}")
    fun findContestById(
        @PathVariable id: UUID,
    ): ResponseEntity<ContestPublicOutputDTO> {
        logger.info("[GET] /v1/contests/{id} - id: $id")
        val contest = findContestService.findById(id)
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest with id: $id has not started yet.")
        }
        return ResponseEntity.ok(contest.toPublicOutputDTO())
    }

    @GetMapping("/{id}/full")
    @Private(Member.Type.ROOT)
    fun findFullContestById(
        @PathVariable id: UUID,
    ): ResponseEntity<ContestFullResponseDTO> {
        logger.info("[GET] /v1/contests/{id}/full - id: $id")
        val contest = findContestService.findById(id)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @GetMapping("/{id}/leaderboard")
    fun findContestLeaderboardById(
        @PathVariable id: UUID,
    ): ResponseEntity<ContestLeaderboardOutputDTO> {
        logger.info("[GET] /v1/contests/{id}/leaderboard - id: $id")
        val contest = findContestService.findById(id)
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest with id: $id has not started yet.")
        }
        val leaderboard = findContestService.buildContestLeaderboard(contest)
        return ResponseEntity.ok(leaderboard)
    }

    @DeleteMapping("/{id}")
    @Private(Member.Type.ROOT)
    @Transactional
    fun deleteContest(
        @PathVariable id: UUID,
    ): ResponseEntity<Void> {
        logger.info("[DELETE] /v1/contests/{id} - id: $id")
        deleteContestService.delete(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/submissions")
    fun findAllContestSubmissions(
        @PathVariable id: UUID,
    ): ResponseEntity<List<SubmissionPublicResponseDTO>> {
        logger.info("[GET] /v1/contests/{id}/submissions - id: $id")
        val submissions = findSubmissionService.findAllByContest(id)
        return ResponseEntity.ok(submissions.map { it.toPublicResponseDTO() })
    }

    @GetMapping("/{id}/submissions/full")
    @Private(Member.Type.JURY)
    fun findAllContestFullSubmissions(
        @PathVariable id: UUID,
    ): ResponseEntity<List<SubmissionFullResponseDTO>> {
        logger.info("[GET] /v1/contests/{id}/submissions/full - id: $id")
        val submissions = findSubmissionService.findAllByContest(id)
        return ResponseEntity.ok(submissions.map { it.toFullResponseDTO() })
    }
}
