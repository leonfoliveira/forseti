package com.forsetijudge.core.domain.entity

import com.github.f4b6a3.uuid.UuidCreator
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
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
@Table(name = "problem")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at is null")
class Problem(
    id: UUID = UuidCreator.getTimeOrderedEpoch(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    /**
     * The contest to which this problem belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    @Audited(withModifiedFlag = false)
    val contest: Contest,
    /**
     * A letter identifier for the problem, typically used in contests tables.
     */
    @Column(nullable = false)
    var letter: Char,
    /**
     * A hexadecimal color code representing the problem's color.
     */
    @Column(nullable = false)
    var color: String,
    /**
     * The title of the problem, which is displayed to participants.
     */
    @Column(nullable = false)
    var title: String,
    /**
     * Description of the problem, which provides details and requirements for solving it.
     */
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "description_id", nullable = false)
    @Audited(withModifiedFlag = true, modifiedColumnName = "description_id_mod")
    var description: Attachment,
    /**
     * Time limit for solving the problem, in milliseconds.
     */
    @Column(name = "time_limit", nullable = false)
    var timeLimit: Int,
    /**
     * Memory limit for solving the problem, in megabytes.
     */
    @Column(name = "memory_limit", nullable = false)
    var memoryLimit: Int,
    /**
     * Input format for the problem, which specifies how the input data is structured.
     */
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "test_cases_id", nullable = false)
    @Audited(withModifiedFlag = true, modifiedColumnName = "test_cases_id_mod")
    var testCases: Attachment,
    /**
     * Submissions made for this problem, which include the solutions provided by participants.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "problem", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("createdAt ASC")
    var submissions: List<Submission> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version)
