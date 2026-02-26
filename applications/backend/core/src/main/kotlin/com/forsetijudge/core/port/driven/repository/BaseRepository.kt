package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.BaseEntity
import org.springframework.data.repository.Repository
import java.util.UUID

/**
 * Base JPA repository interface for all entities extending BaseEntity
 */
interface BaseRepository<E : BaseEntity> : Repository<E, UUID> {
    fun save(entity: E): E

    fun saveAll(entities: Iterable<E>): List<E>
}
