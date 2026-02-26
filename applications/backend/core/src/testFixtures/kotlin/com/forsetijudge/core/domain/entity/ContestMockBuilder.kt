package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import java.time.OffsetDateTime
import java.util.UUID

object ContestMockBuilder {
    fun build(
        id: UUID = IdGenerator.getUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        slug: String = "contest",
        title: String = "Contest Title",
        languages: List<Submission.Language> = listOf(Submission.Language.PYTHON_312),
        startAt: OffsetDateTime = OffsetDateTime.now().plusHours(1),
        endAt: OffsetDateTime = OffsetDateTime.now().plusHours(2),
        autoFreezeAt: OffsetDateTime? = OffsetDateTime.now().plusMinutes(30),
        frozenAt: OffsetDateTime? = null,
        settings: Contest.Settings = Contest.Settings(isAutoJudgeEnabled = true),
        members: List<Member> = emptyList(),
        problems: List<Problem> = emptyList(),
        clarifications: List<Clarification> = emptyList(),
        announcements: List<Announcement> = emptyList(),
        tickets: List<Ticket<*>> = emptyList(),
    ) = Contest(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        slug = slug,
        title = title,
        languages = languages,
        startAt = startAt,
        endAt = if (endAt < startAt) startAt.plusHours(1) else endAt,
        autoFreezeAt =
            if (autoFreezeAt != null &&
                !(autoFreezeAt > startAt && autoFreezeAt < endAt)
            ) {
                startAt.plusMinutes(30)
            } else {
                autoFreezeAt
            },
        frozenAt = frozenAt,
        settings = settings,
        members = members,
        problems = problems,
        clarifications = clarifications,
        announcements = announcements,
        tickets = tickets,
    )
}
