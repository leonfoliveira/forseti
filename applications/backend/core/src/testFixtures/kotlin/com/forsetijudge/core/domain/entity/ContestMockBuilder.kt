package com.forsetijudge.core.domain.entity

import com.github.f4b6a3.uuid.UuidCreator
import java.time.OffsetDateTime
import java.util.UUID

object ContestMockBuilder {
    fun build(
        id: UUID = UuidCreator.getTimeOrderedEpoch(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        slug: String = "contest",
        title: String = "Contest Title",
        languages: List<Submission.Language> = listOf(Submission.Language.PYTHON_312),
        startAt: OffsetDateTime = OffsetDateTime.now().plusHours(1),
        endAt: OffsetDateTime = OffsetDateTime.now().plusHours(2),
        autoFreezeAt: OffsetDateTime? = OffsetDateTime.now().plusMinutes(30),
        manualFreezeAt: OffsetDateTime? = OffsetDateTime.now().plusMinutes(40),
        unfreezeAt: OffsetDateTime? = OffsetDateTime.now().plusMinutes(50),
        settings: Contest.Settings = Contest.Settings(isAutoJudgeEnabled = true),
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
        autoFreezeAt = autoFreezeAt,
        manualFreezeAt = manualFreezeAt,
        unfreezeAt = unfreezeAt,
        settings = settings,
        members = members,
        problems = problems,
        clarifications = clarifications,
        announcements = announcements,
    )
}
