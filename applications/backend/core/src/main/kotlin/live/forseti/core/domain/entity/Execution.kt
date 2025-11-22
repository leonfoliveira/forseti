package live.forseti.core.domain.entity

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
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "execution")
@Audited
@SQLRestriction("deleted_at is null")
class Execution(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    /**
     * The submission to which this execution belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val submission: Submission,
    /**
     * The answer after the execution of the submission.
     */
    @Column("answer")
    @Enumerated(EnumType.STRING)
    @Audited(withModifiedFlag = false)
    val answer: Submission.Answer,
    /**
     * Number of test cases in the execution.
     */
    @Column("total_test_cases", nullable = false)
    @Audited(withModifiedFlag = false)
    val totalTestCases: Int = 1,
    /**
     * Index of the last test case executed.
     */
    @Column("last_test_case")
    @Audited(withModifiedFlag = false)
    val lastTestCase: Int? = null,
    /**
     * The input attachment for the execution.
     */
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val input: Attachment,
    /**
     * The output attachment for the execution.
     */
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val output: Attachment,
) : BaseEntity(id, createdAt, updatedAt, deletedAt)
