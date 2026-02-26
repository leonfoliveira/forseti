package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.persistence.Column
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PreUpdate
import jakarta.persistence.Version
import org.hibernate.envers.Audited
import java.time.OffsetDateTime
import java.util.UUID

@MappedSuperclass
@Audited(withModifiedFlag = true)
open class BaseEntity(
    @Id
    open val id: UUID = IdGenerator.getUUID(),
    @Column(name = "created_at", nullable = false)
    @Audited(withModifiedFlag = false)
    open val createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
    @Column(name = "updated_at", nullable = false)
    @Audited(withModifiedFlag = false)
    open var updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
    @Column(name = "deleted_at")
    open var deletedAt: OffsetDateTime? = null,
    @Version
    @Audited(withModifiedFlag = false)
    @Column(name = "version", nullable = false)
    open var version: Long = 1L,
) {
    @PreUpdate
    protected fun onUpdate() {
        updatedAt = ExecutionContext.get().startedAt
    }
}
