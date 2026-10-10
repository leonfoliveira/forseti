package com.forsetijudge.core.port.output.repository

import com.forsetijudge.core.domain.entity.Announcement
import java.util.UUID
import org.springframework.data.jpa.repository.Query

/**
 * Accessor for persistence operations related to Announcement entity
 */
interface AnnouncementRepository : BaseRepository<Announcement> {
    @Query("SELECT a FROM Announcement a WHERE a.id = ?1 AND deletedAt IS NULL")
    fun findById(id: UUID): Announcement?

    @Query("SELECT a FROM Announcement a WHERE a.contest.id = ?1 AND deletedAt IS NULL")
    fun findAllByContestId(contestId: UUID): List<Announcement>
}
