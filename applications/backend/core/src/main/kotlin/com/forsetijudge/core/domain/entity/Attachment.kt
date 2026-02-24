package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.envers.Audited
import org.hibernate.envers.NotAudited
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "attachment")
@Audited(withModifiedFlag = true)
class Attachment(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
    updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    /**
     * The contest to which this attachment belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    @Audited(withModifiedFlag = false)
    val contest: Contest,
    /**
     * The member who uploaded this attachment.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    @Audited(withModifiedFlag = false)
    val member: Member,
    /**
     * Original filename of the attachment. This is important for compiling Java code.
     */
    @Column(nullable = false)
    @Audited(withModifiedFlag = false)
    val filename: String,
    /**
     * The original content type of the attachment.
     */
    @Column(nullable = false)
    @Audited(withModifiedFlag = false)
    val contentType: String,
    /**
     * The context in which the attachment was uploaded.
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Audited(withModifiedFlag = false)
    val context: Context,
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
    enum class Context {
        PROBLEM_DESCRIPTION,
        PROBLEM_TEST_CASES,
        SUBMISSION_CODE,
        EXECUTION_OUTPUT,
    }
}
