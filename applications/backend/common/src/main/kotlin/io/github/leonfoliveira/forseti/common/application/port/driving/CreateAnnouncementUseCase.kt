package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Announcement
import io.github.leonfoliveira.forseti.common.application.dto.input.announcement.CreateAnnouncementInputDTO
import java.util.UUID

interface CreateAnnouncementUseCase {
    /**
     * Creates a new announcement for a contest.
     *
     * @param contestId The ID of the contest where the announcement is being created.
     * @param memberId The ID of the member creating the announcement.
     * @param input The input data for creating the announcement.
     * @return The created announcement entity.
     */
    fun create(
        contestId: UUID,
        memberId: UUID,
        input: CreateAnnouncementInputDTO,
    ): Announcement
}
