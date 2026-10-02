package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.attachment.AttachmentCommiter
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.input.usecase.submission.CreateSubmissionUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.ProblemRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.test.factory.MockEntityFactory
import java.time.OffsetDateTime
import java.util.UUID
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class CreateSubmissionServiceTest {
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val problems = mock<ProblemRepository>()
    private val submissions = mock<SubmissionRepository>()
    private val committer = mock<AttachmentCommiter>()
    private val events = mock<BusinessEventPublisher>()
    private val service = CreateSubmissionService(contests, members, problems, submissions, committer, events)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `creates submission for active contestant and publishes event`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        val problem = MockEntityFactory.problem(contest = contest)
        val code = MockEntityFactory.attachment(
            contest = contest,
            member = member,
            context = Attachment.Context.SUBMISSION_CODE,
        )
        val command = command(contest.id, problem.id, code.id)
        TestAuthentication.setMember(member)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(problems.findByIdAndContestId(problem.id, contest.id)).thenReturn(problem)
        whenever(committer.commit(code.id, contest.id, Attachment.Context.SUBMISSION_CODE)).thenReturn(code)

        val response = service.execute(command)

        assertEquals(member.id, response.member.id)
        assertEquals(problem.id, response.problem.id)
        assertEquals(Submission.Status.JUDGING, response.status)
        verify(submissions).save(any())
        verify(events).publish(org.mockito.kotlin.check { event ->
            assertEquals(SubmissionEvent.Created(response.id), event)
        })
    }

    @Test
    fun `rejects unsupported language and missing problem`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        val problem = MockEntityFactory.problem(contest = contest)
        val code = MockEntityFactory.attachment(contest = contest, member = member)
        TestAuthentication.setMember(member)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(problems.findByIdAndContestId(problem.id, contest.id)).thenReturn(problem)
        whenever(committer.commit(code.id, contest.id, Attachment.Context.SUBMISSION_CODE)).thenReturn(code)

        assertThrows(ForbiddenException::class.java) {
            service.execute(command(contest.id, problem.id, code.id, Submission.Language.JAVA_21))
        }
        verify(submissions, never()).save(any())

        whenever(problems.findByIdAndContestId(problem.id, contest.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(command(contest.id, problem.id, code.id))
        }
    }

    private fun command(
        contestId: UUID,
        problemId: UUID,
        codeId: UUID,
        language: Submission.Language = Submission.Language.CPP_17,
    ) = CreateSubmissionUseCase.Command(
        contestId,
        problemId,
        language,
        AttachmentCommandDTO(codeId),
    )
}
