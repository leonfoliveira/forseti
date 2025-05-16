package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.Column
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PreUpdate
import org.hibernate.envers.Audited
import java.time.LocalDateTime

@MappedSuperclass
@Audited
open class BaseEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = TimeUtils.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = TimeUtils.now(),
    @Column(name = "deleted_at")
    var deletedAt: LocalDateTime? = null,
) {
    @PreUpdate
    protected fun onUpdate() {
        updatedAt = TimeUtils.now()
    }
}
