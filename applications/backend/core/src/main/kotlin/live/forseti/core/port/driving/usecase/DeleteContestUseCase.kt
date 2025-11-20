package live.forseti.core.port.driving.usecase

import live.forseti.core.domain.entity.Member
import java.util.UUID

interface DeleteContestUseCase {
    /**
     * Deletes a contest by its ID.
     *
     * @param id The ID of the contest to delete.
     */
    fun delete(id: UUID)

    /**
     * Deletes multiple members from contests.
     *
     * @param members The list of members to delete.
     */
    fun deleteMembers(members: List<Member>)
}
