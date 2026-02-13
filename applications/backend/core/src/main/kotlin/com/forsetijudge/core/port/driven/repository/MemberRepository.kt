package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Member
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Member entity
 */
interface MemberRepository : BaseRepository<Member> {
    fun findEntityById(id: UUID): Member?

    /**
     * Finds a member by their login and optionally by contest ID.
     * If contestId is null, it will look for members without a contest association.
     *
     * @param login The login of the member to find.
     * @param contestId The ID of the contest to filter by, or null to find members without a contest.
     * @return The member matching the login and contest criteria, or null
     */
    @Query("SELECT m FROM Member m WHERE m.login = :login AND (:contestId IS NULL AND m.contest IS NULL OR m.contest.id = :contestId)")
    fun findByLoginAndContestId(
        login: String,
        contestId: UUID?,
    ): Member?
}
