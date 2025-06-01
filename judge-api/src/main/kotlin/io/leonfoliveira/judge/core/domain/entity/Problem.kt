package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import java.time.LocalDateTime

@Entity
@Table(name = "problem")
@Audited
@SQLRestriction("deleted_at is null")
class Problem(
    id: Int = 0,
    createdAt: LocalDateTime = TimeUtils.now(),
    updatedAt: LocalDateTime = TimeUtils.now(),
    deletedAt: LocalDateTime? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    val contest: Contest,
    @Column(nullable = false)
    var title: String,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "description_key", referencedColumnName = "key", nullable = false)
    var description: Attachment,
    @Column(name = "time_limit", nullable = false)
    var timeLimit: Int,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "test_cases_key", referencedColumnName = "key", nullable = false)
    var testCases: Attachment,
    @OneToMany(mappedBy = "problem", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var submissions: List<Submission> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt)
