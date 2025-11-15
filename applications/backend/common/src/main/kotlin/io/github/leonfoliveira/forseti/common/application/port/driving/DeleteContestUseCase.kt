package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
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
