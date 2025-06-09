package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.OffsetDateTime
import java.util.UUID

object ContestMockFactory {
    fun build(
        id: UUID = UUID.randomUUID(),
        slug: String = "contest-slug",
        title: String = "Contest Title",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: OffsetDateTime = OffsetDateTime.now(),
        endAt: OffsetDateTime = OffsetDateTime.now().plusHours(1),
        members: List<Member> = emptyList(),
        problems: List<Problem> = emptyList(),
    ) = Contest(
        id = id,
        slug = slug,
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = endAt,
        members = members,
        problems = problems,
    )
}
