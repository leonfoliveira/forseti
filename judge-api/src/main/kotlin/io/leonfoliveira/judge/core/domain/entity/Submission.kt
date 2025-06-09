package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.domain.enumerate.Language
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "submission")
@Audited
@SQLRestriction("deleted_at is null")
class Submission(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val member: Member,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val problem: Problem,
    @Column("language", nullable = false)
    @Enumerated(EnumType.STRING)
    val language: Language,
    @Column("status", nullable = false)
    @Enumerated(EnumType.STRING)
    var status: Status,
    @Column("answer")
    @Enumerated(EnumType.STRING)
    var answer: Answer = Answer.NO_ANSWER,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "code_id", nullable = false)
    @Audited(withModifiedFlag = true, modifiedColumnName = "code_id_mod")
    val code: Attachment,
) : BaseEntity(id, createdAt, updatedAt, deletedAt) {
    val contest get() = problem.contest

    enum class Status {
        JUDGING,
        FAILED,
        JUDGED,
    }

    enum class Answer {
        NO_ANSWER,
        ACCEPTED,
        WRONG_ANSWER,
        COMPILATION_ERROR,
        RUNTIME_ERROR,
        TIME_LIMIT_EXCEEDED,
    }
}
