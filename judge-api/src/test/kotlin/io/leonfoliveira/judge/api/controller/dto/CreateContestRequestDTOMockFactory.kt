package io.leonfoliveira.judge.api.controller.dto

import io.leonfoliveira.judge.api.controller.dto.request.CreateContestRequestDTO
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

object CreateContestRequestDTOMockFactory {
    fun build(
        title: String = "Contest Title",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: LocalDateTime = LocalDateTime.now(),
        endAt: LocalDateTime = LocalDateTime.now(),
        members: List<CreateContestRequestDTO.MemberDTO> = emptyList(),
        problems: List<CreateContestRequestDTO.ProblemDTO> = emptyList(),
    ) = CreateContestRequestDTO(
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = endAt,
        members = members,
        problems = problems,
    )
}
