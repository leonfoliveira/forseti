package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.OffsetDateTime
import java.util.UUID

object UpdateContestInputDTOMockFactory {
    fun build(
        id: UUID = UUID.randomUUID(),
        slug: String = "contest-slug",
        title: String = "Contest Title",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: OffsetDateTime = OffsetDateTime.now(),
        endAt: OffsetDateTime = OffsetDateTime.now().plusDays(1),
        members: List<UpdateContestInputDTO.MemberDTO> = listOf(buildMemberDTO()),
        problems: List<UpdateContestInputDTO.ProblemDTO> = listOf(buildProblemDTO()),
    ) = UpdateContestInputDTO(
        id = id,
        slug = slug,
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = endAt,
        members = members,
        problems = problems,
    )

    fun buildMemberDTO(
        id: UUID? = UUID.randomUUID(),
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
        id: UUID? = UUID.randomUUID(),
        letter: Char = 'A',
        title: String = "Problem Title",
        description: AttachmentInputDTO = AttachmentInputDTOMockFactory.build(),
        timeLimit: Int = 1000,
        testCases: AttachmentInputDTO = AttachmentInputDTOMockFactory.build(),
    ) = UpdateContestInputDTO.ProblemDTO(
        id = id,
        letter = letter,
        title = title,
        description = description,
        timeLimit = timeLimit,
        testCases = testCases,
    )
}
