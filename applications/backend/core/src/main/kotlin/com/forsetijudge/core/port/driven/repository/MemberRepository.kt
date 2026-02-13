package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Member
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Member entity
 */
interface MemberRepository : BaseRepository<Member> {
    fun findEntityById(id: UUID): Member?

    @Query("select m from Member m where m.login = ?1 and m.contest.id = ?2")
    fun findByLoginAndContestId(
        login: String,
        id: UUID,
    ): Member?

    @Query("select m from Member m where m.login = ?1 and m.contest is null")
    fun findByLoginAndContestNull(login: String): Member?
}
