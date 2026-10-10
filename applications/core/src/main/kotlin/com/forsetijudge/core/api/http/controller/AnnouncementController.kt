package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.http.dto.request.announcement.CreateAnnouncementRequestBody
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.announcement.CreateAnnouncementUseCase
import com.forsetijudge.core.util.SafeLogger
import java.util.UUID
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class AnnouncementController(
    private val announcementUseCase: CreateAnnouncementUseCase,
) {
    private val logger = SafeLogger(this::class)

    @PostMapping("/contests/{contestId}/announcements")
    @PreAuthorize("hasAnyRole('ROOT', 'ADMIN')")
    fun create(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateAnnouncementRequestBody,
    ): ResponseEntity<AnnouncementResponseBodyDTO> {
        logger.info("[POST] /v1/contests/$contestId/announcements")
        val announcement =
            announcementUseCase.execute(
                CreateAnnouncementUseCase.Command(
                    contestId = contestId,
                    text = body.text,
                ),
            )
        return ResponseEntity.ok(announcement)
    }
}
