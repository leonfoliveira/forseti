package io.leonfoliveira.judge.core.entity

import io.leonfoliveira.judge.core.entity.enumerate.Language
import io.leonfoliveira.judge.core.entity.model.Attachment
import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.AttributeOverride
import jakarta.persistence.AttributeOverrides
import jakarta.persistence.Column
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.envers.Audited
import java.time.LocalDateTime

@Entity
@Table(name = "submission")
@Audited
class Submission(
    id: Int = 0,
    createdAt: LocalDateTime = TimeUtils.now(),
    updatedAt: LocalDateTime = TimeUtils.now(),
    deleted: LocalDateTime? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    val member: Member,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    val problem: Problem,
    @Enumerated(EnumType.STRING)
    val language: Language,
    @Enumerated(EnumType.STRING)
    var status: Status,
    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "filename", column = Column(name = "code_filename")),
        AttributeOverride(name = "key", column = Column(name = "code_key")),
    )
    val code: Attachment,
) : BaseEntity(id, createdAt, updatedAt, deleted) {
    val contest by lazy {
        problem.contest
    }

    enum class Status {
        JUDGING,
        ACCEPTED,
        WRONG_ANSWER,
        COMPILATION_ERROR,
        RUNTIME_ERROR,
        TIME_LIMIT_EXCEEDED,
    }
}
