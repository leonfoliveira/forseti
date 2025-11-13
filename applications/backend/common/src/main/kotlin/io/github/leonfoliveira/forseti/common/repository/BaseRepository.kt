package io.github.leonfoliveira.forseti.common.repository

import io.github.leonfoliveira.forseti.common.domain.entity.BaseEntity
import org.springframework.data.repository.CrudRepository
import java.util.UUID

/**
 * Base JPA repository interface for all entities extending BaseEntity
 */
interface BaseRepository<E : BaseEntity> : CrudRepository<E, UUID>
