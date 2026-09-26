package com.forsetijudge.core.port.output.repository

import com.forsetijudge.core.domain.entity.BaseEntity
import java.util.UUID
import org.springframework.data.repository.Repository

/**
 * Base JPA repository interface for all entities extending BaseEntity
 */
interface BaseRepository<E : BaseEntity> : Repository<E, UUID> {
    fun save(entity: E): E

    fun saveAll(entities: Iterable<E>): List<E>
}
