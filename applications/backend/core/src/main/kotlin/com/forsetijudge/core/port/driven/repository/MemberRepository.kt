package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Member
import java.util.UUID

/**
 * Accessor for persistence operations related to Member entity
 */
interface MemberRepository : BaseRepository<Member> {
    fun findEntityById(id: UUID): Member?

    fun findByLoginAndContestId(
        login: String,
        contestId: UUID?,
    ): Member?
}
