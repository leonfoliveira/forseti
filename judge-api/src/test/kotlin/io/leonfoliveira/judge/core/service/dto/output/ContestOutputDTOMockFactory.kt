package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

object ContestOutputDTOMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Contest Title",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: LocalDateTime = LocalDateTime.now(),
        endAt: LocalDateTime = LocalDateTime.now().plusDays(1),
        members: List<MemberOutputDTO> = emptyList(),
        problems: List<ProblemOutputDTO> = emptyList(),
    ) = ContestOutputDTO(
        id = id,
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = endAt,
        members = members,
        problems = problems,
    )
}
