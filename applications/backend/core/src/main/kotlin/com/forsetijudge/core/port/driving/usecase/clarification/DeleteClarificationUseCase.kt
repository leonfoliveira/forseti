package com.forsetijudge.core.port.driving.usecase.clarification

import java.util.UUID

interface DeleteClarificationUseCase {
    /**
     * Deletes a clarification by its ID.
     *
     * @param contestId The ID of the contest.
     * @param memberId The ID of the member performing the deletion.
     * @param id The ID of the clarification to delete.
     */
    fun delete(
        contestId: UUID,
        memberId: UUID,
        id: UUID,
    )
}
