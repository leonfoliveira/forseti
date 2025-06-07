package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.dto.request.UpdateSubmissionStatusRequestDTO
import io.leonfoliveira.judge.api.dto.response.SubmissionFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.toFullResponseDTO
import io.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.leonfoliveira.judge.api.util.Private
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.service.dto.input.CreateSubmissionInputDTO
import io.leonfoliveira.judge.core.service.submission.CreateSubmissionService
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
import io.leonfoliveira.judge.core.service.submission.UpdateSubmissionService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/submissions")
class SubmissionController(
    private val createSubmissionService: CreateSubmissionService,
    private val findSubmissionService: FindSubmissionService,
    private val updateSubmissionService: UpdateSubmissionService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping
    @Private(Member.Type.CONTESTANT)
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
    fun findAllFullForMember(): ResponseEntity<List<SubmissionFullResponseDTO>> {
        logger.info("[GET] /v1/submissions/me")
        val authorization = AuthorizationContextUtil.getAuthorization()
        val submissions = findSubmissionService.findAllByMember(authorization.id)
        return ResponseEntity.ok(submissions.map { it.toFullResponseDTO() })
    }

    @PatchMapping("/{id}/status")
    @Private(Member.Type.JUDGE)
    fun updateSubmissionStatus(
        @PathVariable id: UUID,
        @RequestBody body: UpdateSubmissionStatusRequestDTO,
    ): ResponseEntity<Void> {
        logger.info("[PATCH] /v1/submissions/{id}/status - id: $id, body: $body")
        updateSubmissionService.updateStatus(id, body.status)
        return ResponseEntity.noContent().build()
    }
}
