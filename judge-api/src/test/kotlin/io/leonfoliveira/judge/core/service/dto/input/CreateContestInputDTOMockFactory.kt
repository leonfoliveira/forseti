package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.OffsetDateTime

object CreateContestInputDTOMockFactory {
    fun build(
        slug: String = "contest-slug",
        title: String = "Contest Title",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: OffsetDateTime = OffsetDateTime.now(),
        endAt: OffsetDateTime = OffsetDateTime.now().plusDays(1),
        members: List<CreateContestInputDTO.MemberDTO> = listOf(buildMemberDTO()),
        problems: List<CreateContestInputDTO.ProblemDTO> = listOf(buildProblemDTO()),
    ) = CreateContestInputDTO(
        slug = slug,
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
        letter: Char = 'A',
        title: String = "Problem Title",
        description: AttachmentInputDTO = AttachmentInputDTOMockFactory.build(),
        timeLimit: Int = 1000,
        testCases: AttachmentInputDTO = AttachmentInputDTOMockFactory.build(),
    ) = CreateContestInputDTO.ProblemDTO(
        letter = letter,
        title = title,
        description = description,
        timeLimit = timeLimit,
        testCases = testCases,
    )
}
