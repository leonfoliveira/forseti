package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
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
@Table(name = "submission")
@Audited
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
@SQLRestriction("deleted_at IS NULL")
open class Submission(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
    updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    /**
     * The member who made this submission.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val member: Member,
    /**
     * The problem to which this submission belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val problem: Problem,
    /**
     * The programming language used for this submission.
     */
    @Column("language", nullable = false)
    @Enumerated(EnumType.STRING)
    @Audited(withModifiedFlag = false)
    val language: Language,
    /**
     * The status of the submission, indicating whether it is being judged, has failed, or has been judged.
     */
    @Column("status", nullable = false)
    @Enumerated(EnumType.STRING)
    var status: Status,
    /**
     * The answer to the submission. It will be null if the submission has not been judged yet.
     */
    @Column("answer")
    @Enumerated(EnumType.STRING)
    var answer: Answer? = null,
    /**
     * The code submitted by the member for the problem.
     */
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "code_id", nullable = false)
    @Audited(withModifiedFlag = false)
    val code: Attachment,
    /**
     * The list of executions associated with this submission.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "submission", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("createdAt ASC")
    val executions: List<Execution> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
    val contest get() = problem.contest

    enum class Language {
        /** C++ 17 */
        CPP_17,

        /** Java 21 */
        JAVA_21,

        /** Python 3.12 */
        PYTHON_312,
    }

    enum class Status {
        /**
         * The submission is currently being judged.
         */
        JUDGING,

        /**
         * The submission has failed to be judged by the auto jury.
         */
        FAILED,

        /**
         * The submission has been judged and the result is available.
         */
        JUDGED,
    }

    enum class Answer {
        /**
         * The submission has been accepted, meaning it passed all tests and requirements.
         */
        ACCEPTED,

        /**
         * The submission has been judged but did not pass, indicating it failed to meet the problem requirements.
         */
        WRONG_ANSWER,

        /**
         * The submission code has failed to be compiled. This only applies to languages that require compilation.
         */
        COMPILATION_ERROR,

        /**
         * The submission has encountered a runtime error during execution.
         */
        RUNTIME_ERROR,

        /**
         * The submission has exceeded the time limit set for the problem.
         */
        TIME_LIMIT_EXCEEDED,

        /**
         * The submission has exceeded the memory limit set for the problem.
         */
        MEMORY_LIMIT_EXCEEDED,
    }
}
