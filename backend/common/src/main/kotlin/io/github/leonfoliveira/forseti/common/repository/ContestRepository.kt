package io.github.leonfoliveira.forseti.common.repository

import io.github.leonfoliveira.forseti.common.domain.entity.Contest

interface ContestRepository : BaseRepository<Contest> {
    fun findBySlug(slug: String): Contest?
}
