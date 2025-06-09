package io.leonfoliveira.judge.core.domain.entity

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
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "problem")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at is null")
class Problem(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    @Audited(withModifiedFlag = false)
    val contest: Contest,
    @Column(nullable = false)
    var letter: Char,
    @Column(nullable = false)
    var title: String,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "description_id", nullable = false)
    @Audited(withModifiedFlag = true, modifiedColumnName = "description_id_mod")
    var description: Attachment,
    @Column(name = "time_limit", nullable = false)
    var timeLimit: Int,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "test_cases_id", nullable = false)
    @Audited(withModifiedFlag = true, modifiedColumnName = "test_cases_id_mod")
    var testCases: Attachment,
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "problem", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var submissions: List<Submission> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt)
