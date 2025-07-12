package io.github.leonfoliveira.judge.common.mock.entity

import io.github.leonfoliveira.judge.common.domain.entity.Announcement
import io.github.leonfoliveira.judge.common.domain.entity.Clarification
import io.github.leonfoliveira.judge.common.domain.entity.Contest
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Problem
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import java.time.OffsetDateTime
import java.util.UUID

object ContestMockBuilder {
    fun build(
        id: UUID = UUID.randomUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        slug: String = "contest",
        title: String = "Contest Title",
        languages: List<Language> = listOf(Language.PYTHON_3_13_3),
        startAt: OffsetDateTime = OffsetDateTime.now().plusHours(1),
        endAt: OffsetDateTime = OffsetDateTime.now().plusHours(2),
        members: List<Member> = emptyList(),
        problems: List<Problem> = emptyList(),
        clarifications: List<Clarification> = emptyList(),
        announcements: List<Announcement> = emptyList(),
    ) = Contest(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        slug = slug,
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = endAt,
        members = members,
        problems = problems,
        clarifications = clarifications,
        announcements = announcements,
    )
}
