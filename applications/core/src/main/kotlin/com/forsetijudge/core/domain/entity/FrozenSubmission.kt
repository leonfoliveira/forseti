package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.util.IdGenerator
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import java.time.OffsetDateTime
import java.util.UUID
import org.hibernate.annotations.SQLRestriction

@Entity
@Table(name = "frozen_submission")
@SQLRestriction("deleted_at IS NULL")
class FrozenSubmission(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
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
    var status: Submission.Status,
    @Column("answer")
    @Enumerated(EnumType.STRING)
    var answer: Submission.Answer? = null,
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "code_id", nullable = false)
    val code: Attachment,
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
    val contest get() = problem.contest

    fun unfreeze(): Submission =
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
}

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
    )
