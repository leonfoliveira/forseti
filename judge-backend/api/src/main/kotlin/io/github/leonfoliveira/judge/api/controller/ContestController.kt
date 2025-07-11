package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.announcement.AnnouncementResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.announcement.toResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.clarification.ClarificationResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.ContestFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.ContestMetadataResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.ContestPublicOutputDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toMetadataDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toPublicOutputDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.SubmissionFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.SubmissionPublicResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toPublicResponseDTO
import io.github.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.service.announcement.CreateAnnouncementService
import io.github.leonfoliveira.judge.common.service.clarification.CreateClarificationService
import io.github.leonfoliveira.judge.common.service.contest.CreateContestService
import io.github.leonfoliveira.judge.common.service.contest.DeleteContestService
import io.github.leonfoliveira.judge.common.service.contest.FindContestService
import io.github.leonfoliveira.judge.common.service.contest.UpdateContestService
import io.github.leonfoliveira.judge.common.service.dto.input.announcement.CreateAnnouncementInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.clarification.CreateClarificationInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.contest.CreateContestInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.contest.UpdateContestInputDTO
import io.github.leonfoliveira.judge.common.service.dto.output.ContestLeaderboardOutputDTO
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
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
    private val contestAuthFilter: ContestAuthFilter,
    private val createContestService: CreateContestService,
    private val updateContestService: UpdateContestService,
    private val findContestService: FindContestService,
    private val deleteContestService: DeleteContestService,
    private val findSubmissionService: FindSubmissionService,
    private val createAnnouncementService: CreateAnnouncementService,
    private val createClarificationService: CreateClarificationService,
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
    @Transactional(readOnly = true)
    fun findAllContestMetadata(): ResponseEntity<List<ContestMetadataResponseDTO>> {
        logger.info("[GET] /v1/contests/metadata")
        val contests = findContestService.findAll()
        return ResponseEntity.ok(contests.map { it.toMetadataDTO() })
    }

    @GetMapping("/slug/{slug}/metadata")
    @Transactional(readOnly = true)
    fun findContestMetadataBySlug(
        @PathVariable slug: String,
    ): ResponseEntity<ContestMetadataResponseDTO> {
        logger.info("[GET] /v1/contests/slug/{slug}/metadata - slug: $slug")
        val contest = findContestService.findBySlug(slug)
        return ResponseEntity.ok(contest.toMetadataDTO())
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    fun findFullContestById(
        @PathVariable id: UUID,
    ): ResponseEntity<ContestFullResponseDTO> {
        logger.info("[GET] /v1/contests/{id}/full - id: $id")
        val contest = findContestService.findById(id)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @GetMapping("/{id}/leaderboard")
    @Transactional(readOnly = true)
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

    @PutMapping("/{id}/start")
    @Private(Member.Type.ROOT)
    @Transactional
    fun forceStartContest(
        @PathVariable id: UUID,
    ): ResponseEntity<ContestMetadataResponseDTO> {
        logger.info("[PUT] /v1/contests/{id}/start - id: $id")
        val contest = updateContestService.forceStart(id)
        return ResponseEntity.ok().body(contest.toMetadataDTO())
    }

    @PutMapping("/{id}/end")
    @Private(Member.Type.ROOT)
    @Transactional
    fun forceEndContest(
        @PathVariable id: UUID,
    ): ResponseEntity<ContestMetadataResponseDTO> {
        logger.info("[PUT] /v1/contests/{id}/end - id: $id")
        val contest = updateContestService.forceEnd(id)
        return ResponseEntity.ok().body(contest.toMetadataDTO())
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
    @Transactional(readOnly = true)
    fun findAllContestSubmissions(
        @PathVariable id: UUID,
    ): ResponseEntity<List<SubmissionPublicResponseDTO>> {
        logger.info("[GET] /v1/contests/{id}/submissions - id: $id")
        val submissions = findSubmissionService.findAllByContest(id)
        return ResponseEntity.ok(submissions.map { it.toPublicResponseDTO() })
    }

    @GetMapping("/{id}/submissions/full")
    @Private(Member.Type.JURY)
    @Transactional(readOnly = true)
    fun findAllContestFullSubmissions(
        @PathVariable id: UUID,
    ): ResponseEntity<List<SubmissionFullResponseDTO>> {
        logger.info("[GET] /v1/contests/{id}/submissions/full - id: $id")
        contestAuthFilter.check(id)
        val submissions = findSubmissionService.findAllByContest(id)
        return ResponseEntity.ok(submissions.map { it.toFullResponseDTO() })
    }

    @PostMapping("/{id}/announcements")
    @Private(Member.Type.JURY)
    @Transactional
    fun createAnnouncement(
        @PathVariable id: UUID,
        @RequestBody body: CreateAnnouncementInputDTO,
    ): ResponseEntity<AnnouncementResponseDTO> {
        logger.info("[POST] /v1/contests/{id}/announcements - id: $id, body: $body")
        contestAuthFilter.check(id)
        val member = AuthorizationContextUtil.getMember()
        val announcement = createAnnouncementService.create(id, member.id, body)
        return ResponseEntity.ok(announcement.toResponseDTO())
    }

    @PostMapping("/{id}/clarifications")
    @Private(Member.Type.CONTESTANT, Member.Type.JURY)
    @Transactional
    fun createClarification(
        @PathVariable id: UUID,
        @RequestBody body: CreateClarificationInputDTO,
    ): ResponseEntity<ClarificationResponseDTO> {
        logger.info("[POST] /v1/contests/{id}/clarifications - id: $id, body: $body")
        contestAuthFilter.check(id)
        val member = AuthorizationContextUtil.getMember()
        val clarification = createClarificationService.create(id, member.id, body)
        return ResponseEntity.ok(clarification.toResponseDTO())
    }
}
