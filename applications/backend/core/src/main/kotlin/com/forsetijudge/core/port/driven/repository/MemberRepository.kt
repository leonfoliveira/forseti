package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Member
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Member entity
 */
interface MemberRepository : BaseRepository<Member> {
    @Query("SELECT m FROM Member m WHERE m.id = ?1 AND m.deletedAt IS NULL")
    fun findById(id: UUID): Member?

    @Query("SELECT m FROM Member m WHERE m.id = ?1 AND m.contest.id = ?2 AND m.deletedAt IS NULL")
    fun findByIdAndContestId(
        id: UUID,
        contestId: UUID,
    ): Member?

    @Query("SELECT m FROM Member m WHERE m.id = ?1 AND m.contest IS NULL AND m.deletedAt IS NULL")
    fun findByIdAndContestIsNull(id: UUID): Member?

    @Query("SELECT m FROM Member m WHERE m.id = ?1 AND (m.contest IS NULL OR m.contest.id = ?2) AND m.deletedAt IS NULL")
    fun findByIdAndContestIdOrContestIsNull(
        id: UUID,
        contestId: UUID,
    ): Member?

    @Query("SELECT m FROM Member m WHERE m.login = ?1 AND m.contest IS NULL AND m.deletedAt IS NULL")
    fun findByLoginAndContestIsNull(login: String): Member?

    @Query("SELECT m FROM Member m WHERE m.login = ?1 AND (m.contest IS NULL OR m.contest.id = ?2) AND m.deletedAt IS NULL")
    fun findByLoginAndContestIdOrContestIsNull(
        login: String,
        contestId: UUID,
    ): Member?

    @Query("SELECT m FROM Member m WHERE m.login = ?1 AND m.contest.id = ?2 AND m.deletedAt IS NULL")
    fun findByLoginAndContestId(
        login: String,
        contestId: UUID,
    ): Member?

    @Query("SELECT m FROM Member m WHERE m.contest.id = ?1 AND m.type = ?2 AND m.deletedAt IS NULL")
    fun findAllByContestIdAndType(
        contestId: UUID,
        type: Member.Type,
    ): List<Member>
}
