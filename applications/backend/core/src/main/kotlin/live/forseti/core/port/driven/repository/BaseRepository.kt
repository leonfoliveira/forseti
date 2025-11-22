package live.forseti.core.port.driven.repository

import live.forseti.core.domain.entity.BaseEntity
import org.springframework.data.repository.CrudRepository
import java.util.UUID

/**
 * Base JPA repository interface for all entities extending BaseEntity
 */
interface BaseRepository<E : BaseEntity> : CrudRepository<E, UUID>
