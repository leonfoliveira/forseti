package io.leonfoliveira.judge.core.repository

import io.leonfoliveira.judge.core.domain.entity.BaseEntity
import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface BaseRepository<E : BaseEntity> : CrudRepository<E, UUID>
