package com.forsetijudge.core.port.input.usecase.member

import com.forsetijudge.core.port.dto.response.member.MemberResponseDTO
import java.util.UUID

interface FindMemberByIdUseCase {
    /**
     * Finds a member by its ID.
     *
     * @param command The command containing the member ID to find.
     * @return The member if found, or null if not found.
     */
    fun execute(command: Command): MemberResponseDTO

    /**
     * Command object for finding a member by ID.
     *
     * @param memberId The ID of the member to find.
     * @return The member if found, or null if not found.
     */
    data class Command(
        val memberId: UUID,
    )
}
