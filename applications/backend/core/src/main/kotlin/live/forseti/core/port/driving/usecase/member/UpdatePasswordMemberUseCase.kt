package live.forseti.core.port.driving.usecase.member

import live.forseti.core.domain.entity.Member
import java.util.UUID

interface UpdatePasswordMemberUseCase {
    /**
     * Updates the password of a member.
     *
     * @param memberId The ID of the member whose password is to be updated.
     * @param password The new password for the member.
     */
    fun update(
        memberId: UUID,
        password: String,
    ): Member
}
