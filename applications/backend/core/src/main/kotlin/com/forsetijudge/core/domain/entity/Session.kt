package com.forsetijudge.core.domain.entity

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
@SQLRestriction("deleted_at is null")
class Session(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    /**
     * The CSRF token associated with this session.
     */
    @Column(name = "csrf_token", nullable = false)
    @Audited(withModifiedFlag = false)
    val csrfToken: UUID,
    /**
     * The member to which this session belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val member: Member,
    /**
     * The expiration time of this session.
     */
    @Column(name = "expires_at", nullable = false)
    @Audited(withModifiedFlag = false)
    val expiresAt: OffsetDateTime,
) : BaseEntity(id, createdAt, updatedAt, deletedAt) {
    /**
     * Checks if the session is about to expire within the given threshold in minutes.
     *
     * @param thresholdMinutes The threshold in minutes to check against.
     * @return True if the session is about to expire, false otherwise.
     */
    fun isAboutToExpire(thresholdMinutes: Long): Boolean {
        val thresholdTime = OffsetDateTime.now().plusMinutes(thresholdMinutes)
        return expiresAt.isBefore(thresholdTime)
    }
}
