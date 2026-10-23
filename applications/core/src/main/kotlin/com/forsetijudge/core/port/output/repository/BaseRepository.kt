package com.forsetijudge.core.port.output.repository

import com.forsetijudge.core.domain.entity.BaseEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

/**
 * Base JPA repository interface for all entities extending BaseEntity
 */
interface BaseRepository<E : BaseEntity> : JpaRepository<E, UUID>
