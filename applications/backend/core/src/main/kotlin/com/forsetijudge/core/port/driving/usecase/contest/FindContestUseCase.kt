package com.forsetijudge.core.port.driving.usecase.contest

import com.forsetijudge.core.domain.entity.Contest
import java.util.UUID

interface FindContestUseCase {
    /**
     * Finds all contests in the system.
     *
     * @return A list of all contest entities.
     */
    fun findAll(): List<Contest>

    /**
     * Finds a contest by its ID.
     * This method can only be used after the contest has started or the member is ADMIN/ROOT.
     *
     * @param memberId The ID of the member requesting the contest.
     * @param id The ID of the contest to find.
     * @return The contest entity.
     * @throws NotFoundException if the contest is not found.
     */
    fun findByIdPublic(
        memberId: UUID?,
        id: UUID,
    ): Contest

    /**
     * Finds a contest by its ID.
     *
     * @param id The ID of the contest to find.
     * @return The contest entity.
     * @throws NotFoundException if the contest is not found.
     */
    fun findById(id: UUID): Contest

    /**
     * Finds a contest by its slug.
     *
     * @param slug The slug of the contest to find.
     * @return The contest entity.
     * @throws NotFoundException if the contest is not found.
     */
    fun findBySlug(slug: String): Contest
}
