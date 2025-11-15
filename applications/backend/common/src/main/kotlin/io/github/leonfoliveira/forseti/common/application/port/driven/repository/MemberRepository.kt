package io.github.leonfoliveira.forseti.common.application.port.driven.repository

import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import java.util.UUID

/**
 * Accessor for persistence operations related to Member entity
 */
interface MemberRepository : BaseRepository<Member> {
    fun findEntityById(id: UUID): Member?

    fun findByLogin(login: String): Member?

    fun findByLoginAndContestId(
        login: String,
        contestId: UUID?,
    ): Member?
}
