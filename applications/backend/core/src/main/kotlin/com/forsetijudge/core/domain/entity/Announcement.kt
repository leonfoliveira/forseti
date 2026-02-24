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
import org.hibernate.envers.NotAudited
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "announcement")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at IS NULL")
class Announcement(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
    updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    /**
     * The contest to which this announcement belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    var contest: Contest,
    /**
     * The member who made this announcement.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    var member: Member,
    /**
     * The text of the announcement.
     */
    @Column(nullable = false)
    var text: String,
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version)
