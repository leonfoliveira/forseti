package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.domain.enumerate.Language
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import org.hibernate.type.SqlTypes
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "contest")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at is null")
class Contest(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    @Column(nullable = false, unique = true)
    var slug: String,
    @Column(nullable = false)
    var title: String,
    @Column(nullable = false)
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Enumerated(EnumType.STRING)
    var languages: List<Language>,
    @Column(name = "start_at", nullable = false)
    var startAt: OffsetDateTime,
    @Column(name = "end_at", nullable = false)
    var endAt: OffsetDateTime,
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var members: List<Member> = mutableListOf(),
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var problems: List<Problem> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt) {
    fun hasStarted(): Boolean {
        return !startAt.isAfter(OffsetDateTime.now())
    }

    fun isActive(): Boolean {
        return hasStarted() && !hasFinished()
    }

    fun hasFinished(): Boolean {
        return !endAt.isAfter(OffsetDateTime.now())
    }
}
