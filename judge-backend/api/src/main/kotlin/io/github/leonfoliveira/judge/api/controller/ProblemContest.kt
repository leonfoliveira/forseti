package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.submission.SubmissionFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.service.dto.input.submission.CreateSubmissionInputDTO
import io.github.leonfoliveira.judge.common.service.submission.CreateSubmissionService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/problems")
class ProblemContest(
    private val contestAuthFilter: ContestAuthFilter,
    private val createSubmissionService: CreateSubmissionService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/{id}/submissions")
    @Private(Member.Type.CONTESTANT)
    @Transactional
    fun createSubmission(
        @PathVariable id: UUID,
        @RequestBody body: CreateSubmissionInputDTO,
    ): ResponseEntity<SubmissionFullResponseDTO> {
        logger.info("[POST] /v1/problems/{id}/submissions - body: $body")
        contestAuthFilter.checkFromProblem(id)
        val member = AuthorizationContextUtil.getMember()
        val submission =
            createSubmissionService.create(
                memberId = member.id,
                problemId = id,
                inputDTO = body,
            )
        return ResponseEntity.ok(submission.toFullResponseDTO())
    }
}
