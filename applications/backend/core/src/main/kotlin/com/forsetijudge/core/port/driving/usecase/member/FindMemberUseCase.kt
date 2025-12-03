package com.forsetijudge.core.port.driving.usecase.member

import com.forsetijudge.core.domain.entity.Member
import java.util.UUID

interface FindMemberUseCase {
    /**
     * Finds a member by their ID.
     *
     * @param id The ID of the member to find.
     * @return The member with the specified ID.
     * @throws NotFoundException if the member is not found.
     */
    fun findById(id: UUID): Member
}
