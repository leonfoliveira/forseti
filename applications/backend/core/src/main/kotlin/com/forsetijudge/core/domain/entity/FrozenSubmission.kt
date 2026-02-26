package com.forsetijudge.core.domain.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.OneToOne
import jakarta.persistence.OrderBy
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "frozen_submission")
@Audited
@SQLRestriction("deleted_at IS NULL")
class FrozenSubmission(
    @Id
    val id: UUID,
    @Column(name = "created_at", nullable = false)
    val createdAt: OffsetDateTime,
    @Column(name = "updated_at", nullable = false)
    val updatedAt: OffsetDateTime,
    @Column(name = "deleted_at")
    val deletedAt: OffsetDateTime?,
    @Column(name = "version", nullable = false)
    val version: Long,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    val member: Member,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    val problem: Problem,
    @Column("language", nullable = false)
    @Enumerated(EnumType.STRING)
    val language: Submission.Language,
    @Column("status", nullable = false)
    @Enumerated(EnumType.STRING)
    val status: Submission.Status,
    @Column("answer")
    @Enumerated(EnumType.STRING)
    val answer: Submission.Answer? = null,
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "code_id", nullable = false)
    val code: Attachment,
    @OneToMany(mappedBy = "submission", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("createdAt ASC")
    val executions: List<Execution>,
)

fun Submission.freeze(): FrozenSubmission =
    FrozenSubmission(
        id = this.id,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        deletedAt = this.deletedAt,
        version = this.version,
        member = this.member,
        problem = this.problem,
        language = this.language,
        status = this.status,
        answer = this.answer,
        code = this.code,
        executions = this.executions,
    )

fun FrozenSubmission.unfreeze(): Submission =
    Submission(
        id = this.id,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        deletedAt = this.deletedAt,
        version = this.version,
        member = this.member,
        problem = this.problem,
        language = this.language,
        status = this.status,
        answer = this.answer,
        code = this.code,
    )
