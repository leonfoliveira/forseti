package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

object CreateContestInputDTOMockFactory {
    fun build(
        title: String = "Contest Title",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: LocalDateTime = LocalDateTime.now(),
        endAt: LocalDateTime = LocalDateTime.now().plusDays(1),
        members: List<CreateContestInputDTO.MemberDTO> = listOf(buildMemberDTO()),
        problems: List<CreateContestInputDTO.ProblemDTO> = listOf(buildProblemDTO()),
    ) = CreateContestInputDTO(
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = endAt,
        members = members,
        problems = problems,
    )

    fun buildMemberDTO(
        type: Member.Type = Member.Type.CONTESTANT,
        name: String = "Contestant Name",
        login: String = "contestant",
        password: String = "contestant",
    ) = CreateContestInputDTO.MemberDTO(
        type = type,
        name = name,
        login = login,
        password = password,
    )

    fun buildProblemDTO(
        title: String = "Problem Title",
        description: AttachmentInputDTO = AttachmentInputDTOMockFactory.build(),
        timeLimit: Int = 1000,
        testCases: AttachmentInputDTO = AttachmentInputDTOMockFactory.build(),
    ) = CreateContestInputDTO.ProblemDTO(
        title = title,
        description = description,
        timeLimit = timeLimit,
        testCases = testCases,
    )
}
