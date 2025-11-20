package live.forseti.core.port.driving.usecase

import java.util.UUID

interface DeleteClarificationUseCase {
    /**
     * Deletes a clarification by its ID.
     *
     * @param id The ID of the clarification to delete.
     */
    fun delete(id: UUID)
}
