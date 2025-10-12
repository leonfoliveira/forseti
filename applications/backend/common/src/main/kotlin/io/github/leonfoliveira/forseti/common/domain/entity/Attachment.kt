package io.github.leonfoliveira.forseti.common.domain.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
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
    /**
     * The contest to which this attachment belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id")
    @Audited(withModifiedFlag = false)
    val contest: Contest,
    /**
     * The member who uploaded this attachment.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    @Audited(withModifiedFlag = false)
    val member: Member? = null,
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
) : BaseEntity(id, createdAt, updatedAt, deletedAt) {
    enum class Context {
        PROBLEM_DESCRIPTION,
        PROBLEM_TEST_CASES,
        SUBMISSION_CODE,
        EXECUTION_OUTPUT,
    }
}
