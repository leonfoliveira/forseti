package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID
import org.hibernate.envers.Audited

@Entity
@Table(name = "attachment")
@Audited
class Attachment(
    @Id
    val key: UUID = UUID.randomUUID(),
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = TimeUtils.now(),
    @Column(nullable = false)
    val filename: String,
    @Column(nullable = false)
    val contentType: String,
)
