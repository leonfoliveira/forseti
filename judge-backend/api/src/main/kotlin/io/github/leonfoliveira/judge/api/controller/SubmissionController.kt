package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.submission.SubmissionFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.core.domain.entity.Member
import io.github.leonfoliveira.judge.core.domain.entity.Submission
import io.github.leonfoliveira.judge.core.service.dto.input.submission.CreateSubmissionInputDTO
import io.github.leonfoliveira.judge.core.service.submission.CreateSubmissionService
import io.github.leonfoliveira.judge.core.service.submission.FindSubmissionService
import io.github.leonfoliveira.judge.core.service.submission.RunSubmissionService
import io.github.leonfoliveira.judge.core.service.submission.UpdateSubmissionService
import java.util.UUID
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/submissions")
class SubmissionController(
    private val createSubmissionService: CreateSubmissionService,
    private val findSubmissionService: FindSubmissionService,
    private val updateSubmissionService: UpdateSubmissionService,
    private val runSubmissionService: RunSubmissionService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping
    @Private(Member.Type.CONTESTANT)
    @Transactional
    fun createSubmission(
        @RequestBody body: CreateSubmissionInputDTO,
    ): ResponseEntity<SubmissionFullResponseDTO> {
        logger.info("[POST] /v1/submissions - body: $body")
        val authentication = AuthorizationContextUtil.getAuthorization()
        val submission =
            createSubmissionService.create(
                memberId = authentication.id,
                inputDTO = body,
            )
        return ResponseEntity.ok(submission.toFullResponseDTO())
    }

    @GetMapping("/full/me")
    @Private(Member.Type.CONTESTANT)
    @Transactional(readOnly = true)
    fun findAllFullSubmissionsForMember(): ResponseEntity<List<SubmissionFullResponseDTO>> {
        logger.info("[GET] /v1/submissions/me")
        val authorization = AuthorizationContextUtil.getAuthorization()
        val submissions = findSubmissionService.findAllByMember(authorization.id)
        return ResponseEntity.ok(submissions.map { it.toFullResponseDTO() })
    }

    @PutMapping("/{id}/fail")
    @Private(Member.Type.AUTO_JURY)
    @Transactional
    fun failSubmission(id: UUID): ResponseEntity<Void> {
        logger.info("[PATCH] /v1/submissions/$id/fail - id: $id")
        updateSubmissionService.fail(id)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{id}/answer/{answer}")
    @Private(Member.Type.AUTO_JURY)
    @Transactional
    fun updateSubmissionAnswer(
        @PathVariable id: UUID,
        @PathVariable answer: Submission.Answer,
    ): ResponseEntity<Void> {
        logger.info("[PATCH] /v1/submissions/{id}/answer - id: $id, answer: $answer")
        updateSubmissionService.updateAnswer(id, answer)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{id}/answer/{answer}/force")
    @Private(Member.Type.JURY)
    @Transactional
    fun updateSubmissionAnswerForce(
        @PathVariable id: UUID,
        @PathVariable answer: Submission.Answer,
    ): ResponseEntity<Void> {
        logger.info("[PATCH] /v1/submissions/{id}/answer/force - id: $id, answer: $answer")
        updateSubmissionService.updateAnswer(id, answer, force = true)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/rerun")
    @Private(Member.Type.JURY)
    @Transactional
    fun rerunSubmission(
        @PathVariable id: UUID,
    ): ResponseEntity<Void> {
        logger.info("[POST] /v1/submissions/$id/rerun - id: $id")
        runSubmissionService.rerun(id)
        return ResponseEntity.noContent().build()
    }
}
