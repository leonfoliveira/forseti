package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime
import java.util.UUID

object UpdateContestInputDTOMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Contest Title",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: LocalDateTime = LocalDateTime.now(),
        endAt: LocalDateTime = LocalDateTime.now().plusDays(1),
        members: List<UpdateContestInputDTO.MemberDTO> = listOf(buildMemberDTO()),
        problems: List<UpdateContestInputDTO.ProblemDTO> = listOf(buildProblemDTO()),
    ) = UpdateContestInputDTO(
        id = id,
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = endAt,
        members = members,
        problems = problems,
    )

    fun buildMemberDTO(
        id: Int? = 1,
        type: Member.Type = Member.Type.CONTESTANT,
        name: String = "Contestant Name",
        login: String = "contestant",
        password: String? = "contestant",
    ) = UpdateContestInputDTO.MemberDTO(
        id = id,
        type = type,
        name = name,
        login = login,
        password = password,
    )

    fun buildProblemDTO(
        id: Int? = 1,
        title: String = "Problem Title",
        descriptionKey: UUID = UUID.randomUUID(),
        timeLimit: Int = 1000,
        testCasesKey: UUID = UUID.randomUUID(),
    ) = UpdateContestInputDTO.ProblemDTO(
        id = id,
        title = title,
        descriptionKey = descriptionKey,
        timeLimit = timeLimit,
        testCasesKey = testCasesKey,
    )
}
