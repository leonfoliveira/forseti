package io.github.leonfoliveira.forseti.api.controller.contest

import io.github.leonfoliveira.forseti.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.clarification.ClarificationResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.forseti.api.util.ContestAuthFilter
import io.github.leonfoliveira.forseti.api.util.Private
import io.github.leonfoliveira.forseti.common.domain.entity.Member
import io.github.leonfoliveira.forseti.common.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.service.clarification.CreateClarificationService
import io.github.leonfoliveira.forseti.common.service.clarification.DeleteClarificationService
import io.github.leonfoliveira.forseti.common.service.dto.input.clarification.CreateClarificationInputDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/contests/{contestId}/clarifications")
class ContestClarificationController(
    val contestAuthFilter: ContestAuthFilter,
    val createClarificationService: CreateClarificationService,
    val deleteClarificationService: DeleteClarificationService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping
    @Private(Member.Type.CONTESTANT, Member.Type.JUDGE, Member.Type.ROOT, Member.Type.ADMIN)
    @Transactional
    @Operation(summary = "Create a clarification")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Clarification created successfully"),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request format",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun createClarification(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateClarificationInputDTO,
    ): ResponseEntity<ClarificationResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/clarifications $body")
        contestAuthFilter.checkIfStarted(contestId)
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
        val member = RequestContext.getContext().session!!.member
        val clarification = createClarificationService.create(contestId, member.id, body)
        return ResponseEntity.ok(clarification.toResponseDTO())
    }

    @DeleteMapping("/{clarificationId}")
    @Operation(
        summary = "Delete a clarification",
        description = "Deletes a clarification by its ID.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "204",
                description = "Clarification deleted successfully",
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Clarification not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    @Private(Member.Type.JUDGE, Member.Type.ADMIN)
    @Transactional(readOnly = true)
    fun deleteClarificationById(
        @PathVariable contestId: UUID,
        @PathVariable clarificationId: UUID,
    ): ResponseEntity<Unit> {
        logger.info("[DELETE] /v1/contests/$contestId/clarifications/$clarificationId")
        deleteClarificationService.delete(clarificationId)
        return ResponseEntity.noContent().build()
    }
}
