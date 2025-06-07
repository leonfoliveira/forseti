package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.envers.Audited
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "attachment")
@Audited(withModifiedFlag = true)
class Attachment(
    id: UUID = UUID.randomUUID(),
    createdAt: LocalDateTime = TimeUtils.now(),
    updatedAt: LocalDateTime = TimeUtils.now(),
    deletedAt: LocalDateTime? = null,
    @Column(nullable = false)
    val filename: String,
    @Column(nullable = false)
    val contentType: String,
) : BaseEntity(id, createdAt, updatedAt, deletedAt)
