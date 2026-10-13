package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.util.IdGenerator
import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.OffsetDateTime
import java.util.UUID
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited

@Entity
@Table(name = "clarification")
@Audited
@SQLRestriction("deleted_at IS NULL")
class Clarification(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    /**
     * The contest to which this clarification belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    var contest: Contest,
    /**
     * The problem to which this clarification belongs, if any.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val problem: Problem?,
    /**
     * The member who made this clarification.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_member_id", nullable = false)
    @Audited(withModifiedFlag = false)
    val member: Member,
    /**
     * The text of the clarification.
     */
    @Column("question_text", nullable = false)
    @Audited(withModifiedFlag = false)
    val text: String,
    /**
     * The answer to this clarification, if any.
     */
    @Embedded
    var answer: Answer? = null,
    /**
     * Whether this clarification is public or not.
     */
    @Column("is_public", nullable = false)
    var isPublic: Boolean = false,
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
    @Embeddable
    data class Answer(
        /**
         * The member who answered this clarification.
         */
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn("answer_member_id", nullable = false)
        val member: Member,
        /**
         * The text of the answer.
         */
        @Column("answer_text", nullable = false)
        val text: String,
    )
}
