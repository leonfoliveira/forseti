package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.OutboxEvent
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface OutboxEventRepository : BaseRepository<OutboxEvent> {
    @Query("SELECT e FROM OutboxEvent e WHERE e.id = :id AND e.deletedAt IS NULL")
    fun findById(id: UUID): OutboxEvent?
}
