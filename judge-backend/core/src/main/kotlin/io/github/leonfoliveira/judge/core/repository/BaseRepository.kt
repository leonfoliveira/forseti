package io.github.leonfoliveira.judge.core.repository

import io.github.leonfoliveira.judge.core.domain.entity.BaseEntity
import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface BaseRepository<E : BaseEntity> : CrudRepository<E, UUID>
