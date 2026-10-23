package com.forsetijudge.core.port.output.repository

import com.forsetijudge.core.domain.entity.BaseEntity
import java.util.UUID
import org.springframework.data.jpa.repository.JpaRepository

/**
 * Base JPA repository interface for all entities extending BaseEntity
 */
interface BaseRepository<E : BaseEntity> : JpaRepository<E, UUID>
