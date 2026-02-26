package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Announcement
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Announcement entity
 */
interface AnnouncementRepository : BaseRepository<Announcement> {
    @Query("SELECT a FROM Announcement a WHERE a.id = :id AND a.deletedAt IS NULL")
    fun findById(id: UUID): Announcement?
}
