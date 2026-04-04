package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import org.hibernate.type.SqlTypes
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "outbox_event")
@Audited
@SQLRestriction("deleted_at IS NULL")
@Suppress("unused")
class OutboxEvent(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
    updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: Status = Status.PENDING,
    @Column(name = "event_type", nullable = false)
    @Audited(withModifiedFlag = false)
    val eventType: String,
    @Column(nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Audited(withModifiedFlag = false)
    val payload: String,
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
    enum class Status {
        PENDING,
        PROCESSED,
    }
}
