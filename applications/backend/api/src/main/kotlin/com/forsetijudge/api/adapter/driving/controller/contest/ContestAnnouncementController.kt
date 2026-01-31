package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.api.adapter.dto.response.ErrorResponseDTO
import com.forsetijudge.api.adapter.dto.response.announcement.AnnouncementResponseDTO
import com.forsetijudge.api.adapter.dto.response.announcement.toResponseDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.announcement.CreateAnnouncementUseCase
import com.forsetijudge.core.port.driving.usecase.contest.AuthorizeContestUseCase
import com.forsetijudge.core.port.dto.input.announcement.CreateAnnouncementInputDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1")
class ContestAnnouncementController(
    private val authorizeContestUseCase: AuthorizeContestUseCase,
    private val createAnnouncementUseCase: CreateAnnouncementUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/contests/{contestId}/announcements")
    @Private(Member.Type.JUDGE, Member.Type.ADMIN)
    @Operation(summary = "Create an announcement")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Announcement created successfully"),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request format",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
        ],
    )
    fun create(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateAnnouncementInputDTO,
    ): ResponseEntity<AnnouncementResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/announcements $body")
        authorizeContestUseCase.checkIfStarted(contestId)
        authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
        val member = RequestContext.getContext().session!!.member
        val announcement = createAnnouncementUseCase.execute(contestId, member.id, body)
        return ResponseEntity.ok(announcement.toResponseDTO())
    }
}
