package io.github.leonfoliveira.judge.core.repository

import io.github.leonfoliveira.judge.core.domain.entity.Contest

interface ContestRepository : BaseRepository<Contest> {
    fun findBySlug(slug: String): Contest?
}
