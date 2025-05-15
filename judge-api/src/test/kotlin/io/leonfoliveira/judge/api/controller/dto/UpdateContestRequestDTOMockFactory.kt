package io.leonfoliveira.judge.api.controller.dto

import io.leonfoliveira.judge.api.controller.dto.request.UpdateContestRequestDTO
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

object UpdateContestRequestDTOMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Contest Title",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: LocalDateTime = LocalDateTime.now(),
        endAt: LocalDateTime = LocalDateTime.now(),
        members: List<UpdateContestRequestDTO.MemberDTO> = emptyList(),
        problems: List<UpdateContestRequestDTO.ProblemDTO> = emptyList(),
    ) = UpdateContestRequestDTO(
        id = id,
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = endAt,
        members = members,
        problems = problems,
    )
}
