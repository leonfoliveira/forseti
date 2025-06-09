package io.leonfoliveira.judge.core.domain.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "member")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at is null")
class Member(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    @Audited(withModifiedFlag = false)
    val contest: Contest,
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var type: Type,
    @Column(nullable = false)
    var name: String,
    @Column(nullable = false)
    var login: String,
    @Column(nullable = false)
    var password: String,
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "member", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var submissions: List<Submission> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt) {
    enum class Type {
        ROOT,
        CONTESTANT,
        JURY,
    }
}
