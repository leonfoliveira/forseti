package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Attachment
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Attachment entity
 */
interface AttachmentRepository : BaseRepository<Attachment> {
    @Query("SELECT a FROM Attachment a WHERE a.id = :id AND a.deletedAt IS NULL")
    fun findById(id: UUID): Attachment?

    @Query("SELECT a FROM Attachment a WHERE a.id = :id AND a.contest.id = :contestId AND a.deletedAt IS NULL")
    fun findByIdAndContestId(
        id: UUID,
        contestId: UUID,
    ): Attachment?
}
