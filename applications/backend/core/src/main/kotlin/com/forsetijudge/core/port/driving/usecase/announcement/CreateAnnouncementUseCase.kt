package com.forsetijudge.core.port.driving.usecase.announcement

import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.port.dto.input.announcement.CreateAnnouncementInputDTO
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
    fun execute(
        contestId: UUID,
        memberId: UUID,
        input: CreateAnnouncementInputDTO,
    ): Announcement
}
