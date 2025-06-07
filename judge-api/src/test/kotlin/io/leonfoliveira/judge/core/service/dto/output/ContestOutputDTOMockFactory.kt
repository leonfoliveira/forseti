package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime
import java.util.UUID

object ContestOutputDTOMockFactory {
    fun build(
        id: UUID = UUID.randomUUID(),
        slug: String = "mock-contest-slug",
        title: String = "Mock Contest",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: LocalDateTime = LocalDateTime.now(),
        endAt: LocalDateTime = LocalDateTime.now().plusDays(1),
        problems: List<ContestOutputDTO.ProblemDTO> = emptyList(),
        members: List<ContestOutputDTO.MemberDTO> = emptyList(),
    ) = ContestOutputDTO(
        id = id,
        slug = slug,
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = endAt,
        problems = problems,
        members = members,
    )
}
