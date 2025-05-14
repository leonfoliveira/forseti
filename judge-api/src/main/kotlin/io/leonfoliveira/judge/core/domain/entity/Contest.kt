package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.envers.Audited
import org.hibernate.type.SqlTypes
import java.time.LocalDateTime

@Entity
@Table(name = "contest")
@Audited
class Contest(
    id: Int = 0,
    createdAt: LocalDateTime = TimeUtils.now(),
    updatedAt: LocalDateTime = TimeUtils.now(),
    deletedAt: LocalDateTime? = null,
    @Column(nullable = false)
    var title: String,
    @Column(nullable = false)
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Enumerated(EnumType.STRING)
    var languages: List<Language>,
    @Column(name = "start_at", nullable = false)
    var startAt: LocalDateTime,
    @Column(name = "end_at", nullable = false)
    var endAt: LocalDateTime,
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY)
    var members: List<Member> = mutableListOf(),
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY)
    var problems: List<Problem> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt)
