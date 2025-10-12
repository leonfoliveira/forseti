package io.github.leonfoliveira.forseti.common.domain.entity

import jakarta.persistence.Column
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PreUpdate
import org.hibernate.envers.Audited
import java.time.OffsetDateTime
import java.util.UUID

@MappedSuperclass
@Audited(withModifiedFlag = true)
open class BaseEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(name = "created_at", nullable = false)
    @Audited(withModifiedFlag = false)
    val createdAt: OffsetDateTime = OffsetDateTime.now(),
    @Column(name = "updated_at", nullable = false)
    @Audited(withModifiedFlag = false)
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),
    @Column(name = "deleted_at")
    var deletedAt: OffsetDateTime? = null,
) {
    @PreUpdate
    protected fun onUpdate() {
        updatedAt = OffsetDateTime.now()
    }
}
