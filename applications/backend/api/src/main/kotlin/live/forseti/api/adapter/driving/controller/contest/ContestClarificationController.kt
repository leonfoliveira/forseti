package live.forseti.api.adapter.driving.controller.contest

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import live.forseti.api.adapter.dto.response.ErrorResponseDTO
import live.forseti.api.adapter.dto.response.clarification.ClarificationResponseDTO
import live.forseti.api.adapter.dto.response.clarification.toResponseDTO
import live.forseti.api.adapter.util.Private
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.clarification.CreateClarificationUseCase
import live.forseti.core.port.driving.usecase.clarification.DeleteClarificationUseCase
import live.forseti.core.port.driving.usecase.contest.AuthorizeContestUseCase
import live.forseti.core.port.dto.input.clarification.CreateClarificationInputDTO
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
    val authorizeContestUseCase: AuthorizeContestUseCase,
    val createClarificationUseCase: CreateClarificationUseCase,
    val deleteClarificationUseCase: DeleteClarificationUseCase,
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
        authorizeContestUseCase.checkIfStarted(contestId)
        authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
        val member = RequestContext.getContext().session!!.member
        val clarification = createClarificationUseCase.create(contestId, member.id, body)
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
        deleteClarificationUseCase.delete(clarificationId)
        return ResponseEntity.noContent().build()
    }
}
