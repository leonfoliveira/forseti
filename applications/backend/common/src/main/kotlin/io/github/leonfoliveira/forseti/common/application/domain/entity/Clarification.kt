package io.github.leonfoliveira.forseti.common.application.domain.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.OrderBy
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "clarification")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at is null")
class Clarification(
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
    var contest: Contest,
    /**
     * The member who made this clarification.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    var member: Member,
    /**
     * The problem to which this clarification belongs.
     * This can be null if the clarification is not related to a specific problem.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = true)
    @Audited(withModifiedFlag = false)
    var problem: Problem?,
    /**
     * The parent clarification, if this clarification is a response to another clarification.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = true)
    @Audited(withModifiedFlag = false)
    var parent: Clarification?,
    /**
     * The text of the clarification, which contains the question or answer.
     */
    @Column(nullable = false)
    var text: String,
    /**
     * The child clarifications, which are responses to this clarification.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("createdAt ASC")
    var children: List<Clarification> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt)
