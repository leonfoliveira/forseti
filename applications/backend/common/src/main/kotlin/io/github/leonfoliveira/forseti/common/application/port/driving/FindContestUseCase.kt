package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import java.util.UUID

interface FindContestUseCase {
    fun findAll(): List<Contest>

    fun findById(id: UUID): Contest

    fun findBySlug(slug: String): Contest
}
