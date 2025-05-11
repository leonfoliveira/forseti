package io.leonfoliveira.judge.core.entity

import io.leonfoliveira.judge.core.entity.model.Attachment
import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.AttributeOverride
import jakarta.persistence.AttributeOverrides
import jakarta.persistence.Column
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.hibernate.envers.Audited
import java.time.LocalDateTime

@Entity
@Table(name = "problem")
@Audited
class Problem(
    id: Int = 0,
    createdAt: LocalDateTime = TimeUtils.now(),
    updatedAt: LocalDateTime = TimeUtils.now(),
    deleted: LocalDateTime? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    val contest: Contest,
    @Column(nullable = false)
    var title: String,
    @Column(nullable = false)
    var description: String,
    @Column(name = "time_limit", nullable = false)
    var timeLimit: Int,
    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "filename", column = Column(name = "test_cases_filename")),
        AttributeOverride(name = "key", column = Column(name = "test_cases_key")),
    )
    var testCases: Attachment,
    @OneToMany(mappedBy = "problem", fetch = FetchType.LAZY)
    var submissions: List<Submission> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deleted)
