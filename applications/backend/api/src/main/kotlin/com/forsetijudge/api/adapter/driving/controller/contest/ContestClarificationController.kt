package com.forsetijudge.api.adapter.driving.controller.contest

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
@RequestMapping("/api/v1")
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
        logger.info("[POST] /api/v1/contests/{}/clarifications", contestId)
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
        logger.info("[DELETE] /api/v1/contests/{}/clarifications/{}", contestId, clarificationId)
        deleteClarificationUseCase.execute(
            DeleteClarificationUseCase.Command(
                clarificationId = clarificationId,
            ),
        )
        return ResponseEntity.noContent().build()
    }
}
