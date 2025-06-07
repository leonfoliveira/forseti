package io.leonfoliveira.judge.core.repository

import io.leonfoliveira.judge.core.domain.entity.Contest

interface ContestRepository : BaseRepository<Contest> {
    fun findBySlug(slug: String): Contest?
}
