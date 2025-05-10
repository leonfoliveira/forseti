package io.leonfoliveira.judge.core.entity

import io.leonfoliveira.judge.core.entity.enumerate.Language
import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table
import java.time.LocalDateTime
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

@Entity
@Table(name = "contest")
class Contest(
    id: Int = 0,
    createdAt: LocalDateTime = TimeUtils.now(),
    updatedAt: LocalDateTime = TimeUtils.now(),
    deleted: LocalDateTime? = null,
    @Column(nullable = false)
    var title: String,
    @Column(nullable = false)
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Enumerated(EnumType.STRING)
    var languages: List<Language>,
    @Column(name = "start_time", nullable = false)
    var startTime: LocalDateTime,
    @Column(name = "end_time", nullable = false)
    var endTime: LocalDateTime,
) : BaseEntity(
    id, createdAt, updatedAt, deleted
)