package io.github.leonfoliveira.forseti.common.application.port.driven.repository

import io.github.leonfoliveira.forseti.common.application.domain.entity.BaseEntity
import org.springframework.data.repository.CrudRepository
import java.util.UUID

/**
 * Base JPA repository interface for all entities extending BaseEntity
 */
interface BaseRepository<E : BaseEntity> : CrudRepository<E, UUID>
