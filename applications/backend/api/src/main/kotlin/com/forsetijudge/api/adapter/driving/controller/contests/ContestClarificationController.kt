package com.forsetijudge.api.adapter.driving.controller.contests

import com.forsetijudge.api.adapter.dto.request.clarification.CreateClarificationRequestBodyDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.clarification.CreateClarificationUseCase
import com.forsetijudge.core.port.driving.usecase.external.clarification.DeleteClarificationUseCase
import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
class ContestClarificationController(
    private val createClarificationUseCase: CreateClarificationUseCase,
    private val deleteClarificationUseCase: DeleteClarificationUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/contests/{contestId}/clarifications")
    @Private(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE, Member.Type.CONTESTANT)
    fun create(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateClarificationRequestBodyDTO,
    ): ResponseEntity<ClarificationResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/clarifications")
        val clarification =
            createClarificationUseCase.execute(
                CreateClarificationUseCase.Command(
                    problemId = body.problemId,
                    parentId = body.parentId,
                    text = body.text,
                ),
            )
        return ResponseEntity.ok(clarification.toResponseBodyDTO())
    }

    @DeleteMapping("/contests/{contestId}/clarifications/{clarificationId}")
    @Private(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)
    fun delete(
        @PathVariable contestId: UUID,
        @PathVariable clarificationId: UUID,
    ): ResponseEntity<Unit> {
        logger.info("[DELETE] /v1/contests/$contestId/clarifications/$clarificationId")
        deleteClarificationUseCase.execute(
            DeleteClarificationUseCase.Command(
                clarificationId = clarificationId,
            ),
        )
        return ResponseEntity.noContent().build()
    }
}
