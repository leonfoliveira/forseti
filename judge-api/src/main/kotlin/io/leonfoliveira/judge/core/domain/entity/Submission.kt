package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.util.TimeUtils
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
import java.time.LocalDateTime

@Entity
@Table(name = "submission")
@Audited
@SQLRestriction("deleted_at is null")
class Submission(
    id: Int = 0,
    createdAt: LocalDateTime = TimeUtils.now(),
    updatedAt: LocalDateTime = TimeUtils.now(),
    deletedAt: LocalDateTime? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    val member: Member,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    val problem: Problem,
    @Column("language", nullable = false)
    @Enumerated(EnumType.STRING)
    val language: Language,
    @Column("status", nullable = false)
    @Enumerated(EnumType.STRING)
    var status: Status,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "code_key", referencedColumnName = "key", nullable = false)
    val code: Attachment,
    @Column("has_failed", nullable = false)
    var hasFailed: Boolean = false,
) : BaseEntity(id, createdAt, updatedAt, deletedAt) {
    val contest get() = problem.contest

    enum class Status {
        JUDGING,
        ACCEPTED,
        WRONG_ANSWER,
        COMPILATION_ERROR,
        RUNTIME_ERROR,
        TIME_LIMIT_EXCEEDED,
    }
}
