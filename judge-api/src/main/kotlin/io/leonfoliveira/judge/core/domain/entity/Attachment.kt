package io.leonfoliveira.judge.core.domain.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.hibernate.envers.Audited
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "attachment")
@Audited(withModifiedFlag = true)
class Attachment(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    @Column(nullable = false)
    val filename: String,
    @Column(nullable = false)
    val contentType: String,
) : BaseEntity(id, createdAt, updatedAt, deletedAt)
