package io.github.leonfoliveira.judge.core.domain.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.OffsetDateTime
import java.util.UUID
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited

@Entity
@Table(name = "clarification")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at is null")
class Clarification (
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    /**
     * The contest to which this clarification belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val contest: Contest,
    /**
     * The member who made this clarification.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val member: Member,
    /**
     * The problem to which this clarification belongs.
     * This can be null if the clarification is not related to a specific problem.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = true)
    @Audited(withModifiedFlag = false)
    val problem: Problem?,
    /**
     * The parent clarification, if this clarification is a response to another clarification.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = true)
    @Audited(withModifiedFlag = false)
    val parent: Clarification?,
    /**
     * The text of the clarification, which contains the question or answer.
     */
    @Column(nullable = false)
    val text: String,
    /**
     * The child clarifications, which are responses to this clarification.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    val children: List<Clarification> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt)
