package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import java.util.UUID

interface DeleteContestUseCase {
    fun delete(id: UUID)

    fun deleteMembers(members: List<Member>)
}
