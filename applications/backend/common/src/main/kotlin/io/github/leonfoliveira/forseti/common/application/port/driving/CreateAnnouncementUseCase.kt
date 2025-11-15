package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Announcement
import io.github.leonfoliveira.forseti.common.application.dto.input.announcement.CreateAnnouncementInputDTO
import java.util.UUID

interface CreateAnnouncementUseCase {
    fun create(
        contestId: UUID,
        memberId: UUID,
        input: CreateAnnouncementInputDTO,
    ): Announcement
}
