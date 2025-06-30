package io.github.leonfoliveira.judge.common.repository

import io.github.leonfoliveira.judge.common.domain.entity.Contest

interface ContestRepository : BaseRepository<Contest> {
    fun findBySlug(slug: String): Contest?
}
