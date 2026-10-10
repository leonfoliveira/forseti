package com.forsetijudge.core.factory

import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.entity.Submission
import java.time.OffsetDateTime
import java.util.UUID

object MockEntityFactory {
    fun contest(
        id: UUID = UUID.randomUUID(),
        startAt: OffsetDateTime = OffsetDateTime.now().minusHours(1),
        endAt: OffsetDateTime = OffsetDateTime.now().plusHours(1),
        problems: List<Problem> = emptyList(),
    ) = Contest(
        id = id,
        slug = "sample-contest",
        title = "Sample contest",
        languages = listOf(Submission.Language.CPP_17),
        startAt = startAt,
        endAt = endAt,
        problems = problems,
    )

    fun member(
        id: UUID = UUID.randomUUID(),
        contest: Contest? = null,
        type: Member.Type = Member.Type.CONTESTANT,
        name: String = "Sample member",
    ) = Member(
        id = id,
        contest = contest,
        type = type,
        name = name,
        login = "sample-login",
        password = "sample-password",
    )

    fun attachment(
        id: UUID = UUID.randomUUID(),
        contest: Contest = contest(),
        member: Member = member(contest = contest),
        filename: String = "sample.txt",
        contentType: String = "text/plain",
        context: Attachment.Context = Attachment.Context.PROBLEM_DESCRIPTION,
        isCommited: Boolean = false,
    ) = Attachment(
        id = id,
        contest = contest,
        member = member,
        filename = filename,
        contentType = contentType,
        context = context,
        isCommited = isCommited,
    )

    fun problem(
        id: UUID = UUID.randomUUID(),
        contest: Contest = contest(),
        letter: Char = 'A',
        color: String = "#123456",
        description: Attachment = attachment(contest = contest),
        testCases: Attachment = attachment(contest = contest, context = Attachment.Context.PROBLEM_TEST_CASES),
    ) = Problem(
        id = id,
        contest = contest,
        letter = letter,
        color = color,
        title = "Sample problem",
        description = description,
        timeLimitMs = 1000,
        memoryLimitMb = 256,
        testCases = testCases,
    )

    fun submission(
        id: UUID = UUID.randomUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        member: Member = member(),
        problem: Problem = problem(contest = member.contest ?: contest()),
        status: Submission.Status = Submission.Status.JUDGED,
        answer: Submission.Answer? = Submission.Answer.WRONG_ANSWER,
    ) = Submission(
        id = id,
        createdAt = createdAt,
        member = member,
        problem = problem,
        language = Submission.Language.CPP_17,
        status = status,
        answer = answer,
        code = attachment(contest = problem.contest, member = member, context = Attachment.Context.SUBMISSION_CODE),
    )

    fun announcement(
        id: UUID = UUID.randomUUID(),
        contest: Contest = contest(),
        member: Member = member(contest = contest),
        text: String = "Sample announcement",
    ) = Announcement(
        id = id,
        contest = contest,
        member = member,
        text = text,
    )
}
