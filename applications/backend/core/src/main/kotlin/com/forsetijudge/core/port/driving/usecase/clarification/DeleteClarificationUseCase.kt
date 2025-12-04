package com.forsetijudge.core.port.driving.usecase.clarification

import java.util.UUID

interface DeleteClarificationUseCase {
    /**
     * Deletes a clarification by its ID.
     *
     * @param id The ID of the clarification to delete.
     */
    fun delete(id: UUID)
}
