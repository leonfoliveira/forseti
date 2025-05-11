package io.leonfoliveira.judge.core.repository

import io.leonfoliveira.judge.core.entity.BaseEntity
import org.springframework.data.repository.CrudRepository

interface BaseRepository<E: BaseEntity> : CrudRepository<E, Int>