package io.github.leonfoliveira.forseti.common.repository

import io.github.leonfoliveira.forseti.common.domain.entity.BaseEntity
import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface BaseRepository<E : BaseEntity> : CrudRepository<E, UUID>
