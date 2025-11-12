package io.github.leonfoliveira.forseti.common.repository

import io.github.leonfoliveira.forseti.common.domain.entity.Member
import java.util.UUID

/**
 * Accessor for persistence operations related to Member entity
 */
interface MemberRepository : BaseRepository<Member> {
    fun findByLogin(login: String): Member?

    fun findByLoginAndContestId(
        login: String,
        contestId: UUID?,
    ): Member?
}
