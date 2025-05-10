package io.leonfoliveira.judge.core.entity

import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.Column
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PreUpdate
import java.time.LocalDateTime
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited

@MappedSuperclass
@Audited
@SQLRestriction("deleted_at is null")
open class BaseEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = TimeUtils.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = TimeUtils.now(),
    @Column(name = "deleted_at", nullable = false)
    var deleted: LocalDateTime? = null,
) {
    @PreUpdate
    protected fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}