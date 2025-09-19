package io.github.leonfoliveira.judge.api.controller.contest

import io.github.leonfoliveira.judge.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.announcement.AnnouncementResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.announcement.toResponseDTO
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import io.github.leonfoliveira.judge.common.service.announcement.CreateAnnouncementService
import io.github.leonfoliveira.judge.common.service.dto.input.announcement.CreateAnnouncementInputDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
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
@RequestMapping("/v1/contests")
class ContestAnnouncementController(
    private val contestAuthFilter: ContestAuthFilter,
    private val createAnnouncementService: CreateAnnouncementService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/{contestId}/announcements")
    @Private(Member.Type.JUDGE, Member.Type.ADMIN)
    @RateLimit
    @Transactional
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
    fun createAnnouncement(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateAnnouncementInputDTO,
    ): ResponseEntity<AnnouncementResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/announcements $body")
        contestAuthFilter.checkIfStarted(contestId)
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
        val member = RequestContext.getContext().session!!.member
        val announcement = createAnnouncementService.create(contestId, member.id, body)
        return ResponseEntity.ok(announcement.toResponseDTO())
    }
}
