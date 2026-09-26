package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.util.IdGenerator
import jakarta.persistence.Column
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.Version
import java.time.OffsetDateTime
import java.util.UUID
import org.hibernate.envers.Audited
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate

@MappedSuperclass
@Audited(withModifiedFlag = true)
open class BaseEntity(
    @Id
    open val id: UUID = IdGenerator.getUUID(),
    @CreatedDate
    @Column(name = "created_at", nullable = false)
    @Audited(withModifiedFlag = false)
    open val createdAt: OffsetDateTime = OffsetDateTime.now(),
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    @Audited(withModifiedFlag = false)
    open var updatedAt: OffsetDateTime = OffsetDateTime.now(),
    @Column(name = "deleted_at")
    open var deletedAt: OffsetDateTime? = null,
    @Version
    @Audited(withModifiedFlag = false)
    @Column(name = "version", nullable = false)
    open var version: Long = 1L,
)
