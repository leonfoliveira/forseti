package com.forsetijudge.api.adapter.driving.http.controller.contests

import com.forsetijudge.api.adapter.dto.request.announcement.CreateAnnouncementRequestBodyDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.announcement.CreateAnnouncementUseCase
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseBodyDTO
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class ContestAnnouncementController(
    private val createAnnouncementUseCase: CreateAnnouncementUseCase,
) {
    private val logger = SafeLogger(this::class)

    @PostMapping("/contests/{contestId}/announcements")
    @Private(Member.Type.ROOT, Member.Type.ADMIN)
    fun create(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateAnnouncementRequestBodyDTO,
    ): ResponseEntity<AnnouncementResponseBodyDTO> {
        logger.info("[POST] /v1/contests/$contestId/announcements")
        val announcement =
            createAnnouncementUseCase.execute(
                CreateAnnouncementUseCase.Command(
                    text = body.text,
                ),
            )
        return ResponseEntity.ok(announcement.toResponseBodyDTO())
    }
}
