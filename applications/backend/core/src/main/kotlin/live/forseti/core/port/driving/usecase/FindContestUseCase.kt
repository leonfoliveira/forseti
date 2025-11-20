package live.forseti.core.port.driving.usecase

import live.forseti.core.domain.entity.Contest
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
