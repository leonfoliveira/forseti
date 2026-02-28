package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "session")
@Audited
@SQLRestriction("deleted_at IS NULL")
class Session(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
    updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    /**
     * The CSRF token associated with this session.
     */
    @Column(name = "csrf_token", nullable = false)
    @Audited(withModifiedFlag = false)
    val csrfToken: UUID,
    /**
     * The member to which this session belongs.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val member: Member,
    /**
     * The expiration time of this session.
     */
    @Column(name = "expires_at", nullable = false)
    @Audited(withModifiedFlag = false)
    val expiresAt: OffsetDateTime,
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version)
