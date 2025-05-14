package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

object ContestMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Contest Title",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: LocalDateTime = LocalDateTime.now(),
        endAt: LocalDateTime = LocalDateTime.now().plusHours(1),
        members: List<Member> = emptyList(),
        problems: List<Problem> = emptyList(),
    ) = Contest(
        id = id,
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = endAt,
        members = members,
        problems = problems,
    )
}
