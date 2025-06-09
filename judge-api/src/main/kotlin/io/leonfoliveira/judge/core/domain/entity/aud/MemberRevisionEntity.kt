package io.leonfoliveira.judge.core.domain.entity.aud

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.envers.RevisionEntity
import org.hibernate.envers.RevisionNumber
import org.hibernate.envers.RevisionTimestamp
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "revinfo")
@RevisionEntity(MemberRevisionListener::class)
class MemberRevisionEntity(
    @Id
    @GeneratedValue
    @RevisionNumber
    private val rev: Long? = null,
    @RevisionTimestamp
    @Column(name = "timestamp", nullable = false)
    private val timestamp: LocalDateTime = LocalDateTime.now(),
    @Column(name = "member_id")
    var memberId: UUID? = null,
    var traceId: String = "",
)
