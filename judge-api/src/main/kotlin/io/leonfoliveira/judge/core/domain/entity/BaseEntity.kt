package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.Column
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PreUpdate
import java.time.LocalDateTime
import java.util.UUID
import org.hibernate.envers.Audited

@MappedSuperclass
@Audited(withModifiedFlag = true)
open class BaseEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(name = "created_at", nullable = false)
    @Audited(withModifiedFlag = false)
    val createdAt: LocalDateTime = TimeUtils.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = TimeUtils.now(),
    @Column(name = "deleted_at")
    var deletedAt: LocalDateTime? = null,
) {
    @PreUpdate
    protected fun onUpdate() {
        updatedAt = TimeUtils.now()
    }
}
