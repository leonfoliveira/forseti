package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.MetricsCollector
import com.forsetijudge.core.application.helper.attachment.AttachmentCommiter
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.input.usecase.submission.CreateSubmissionUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.ProblemRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.IdGenerator
import java.time.OffsetDateTime
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class CreateSubmissionServiceTest {
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val problems = mock<ProblemRepository>()
    private val submissions = mock<SubmissionRepository>()
    private val committer = mock<AttachmentCommiter>()
    private val events = mock<BusinessEventPublisher>()
    private val metricsCollector = mock<MetricsCollector>()
    private val service =
        CreateSubmissionService(contests, members, problems, submissions, committer, events, metricsCollector)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `creates submission for active contestant and publishes event`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        val problem = MockEntityFactory.problem(contest = contest)
        val code =
            MockEntityFactory.attachment(
                contest = contest,
                member = member,
                context = Attachment.Context.SUBMISSION_CODE,
            )
        val command =
            CreateSubmissionUseCase.Command(
                contestId = contest.id,
                problemId = problem.id,
                language = Submission.Language.CPP_17,
                code = AttachmentCommandDTO(id = code.id),
            )
        TestAuthentication.setMember(member)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(problems.findByIdAndContestId(problem.id, contest.id)).thenReturn(problem)
        whenever(committer.commit(code.id, contest.id, Attachment.Context.SUBMISSION_CODE)).thenReturn(code)

        val response = service.execute(command)

        assertEquals(member.id, response.member.id)
        assertEquals(problem.id, response.problem.id)
        assertEquals(Submission.Status.JUDGING, response.status)
        verify(submissions).saveAndFlush(any())
        verify(events).publish(
            org.mockito.kotlin.check { event ->
                assertEquals(SubmissionEvent.Created(response.id), event)
            },
        )
    }

    @Test
    fun `throws NotFoundException when contest does not exist`() {
        val contestId = IdGenerator.getUUID()
        val member = MockEntityFactory.member()
        TestAuthentication.setMember(member)
        whenever(contests.findByIdNullable(contestId)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(
                CreateSubmissionUseCase.Command(
                    contestId = contestId,
                    problemId = IdGenerator.getUUID(),
                    language = Submission.Language.CPP_17,
                    code = AttachmentCommandDTO(id = IdGenerator.getUUID()),
                ),
            )
        }
    }

    @Test
    fun `throws NotFoundException when member does not exist in contest`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(member)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(
                CreateSubmissionUseCase.Command(
                    contestId = contest.id,
                    problemId = IdGenerator.getUUID(),
                    language = Submission.Language.CPP_17,
                    code = AttachmentCommandDTO(id = IdGenerator.getUUID()),
                ),
            )
        }
    }

    @Test
    fun `throws ForbiddenException when member does not belong to contest`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = MockEntityFactory.contest())
        TestAuthentication.setMember(member)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)

        assertThrows(ForbiddenException::class.java) {
            service.execute(
                CreateSubmissionUseCase.Command(
                    contestId = contest.id,
                    problemId = IdGenerator.getUUID(),
                    language = Submission.Language.CPP_17,
                    code = AttachmentCommandDTO(id = IdGenerator.getUUID()),
                ),
            )
        }
    }

    @Test
    fun `throws ForbiddenException when member is not a contestant`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest, type = Member.Type.STAFF)
        TestAuthentication.setMember(member)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)

        assertThrows(ForbiddenException::class.java) {
            service.execute(
                CreateSubmissionUseCase.Command(
                    contestId = contest.id,
                    problemId = IdGenerator.getUUID(),
                    language = Submission.Language.CPP_17,
                    code = AttachmentCommandDTO(id = IdGenerator.getUUID()),
                ),
            )
        }
    }

    @Test
    fun `throws ForbiddenException when contest is not active`() {
        val contest =
            MockEntityFactory.contest(
                startAt = OffsetDateTime.now().plusDays(1),
                endAt = OffsetDateTime.now().plusDays(2),
            )
        val member = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(member)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)

        assertThrows(ForbiddenException::class.java) {
            service.execute(
                CreateSubmissionUseCase.Command(
                    contestId = contest.id,
                    problemId = IdGenerator.getUUID(),
                    language = Submission.Language.CPP_17,
                    code = AttachmentCommandDTO(id = IdGenerator.getUUID()),
                ),
            )
        }
    }

    @Test
    fun `throws NotFoundException when problem does not exist in contest`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(member)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(problems.findByIdAndContestId(IdGenerator.getUUID(), contest.id)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(
                CreateSubmissionUseCase.Command(
                    contestId = contest.id,
                    problemId = IdGenerator.getUUID(),
                    language = Submission.Language.CPP_17,
                    code = AttachmentCommandDTO(id = IdGenerator.getUUID()),
                ),
            )
        }
    }

    @Test
    fun `throws ForbiddenException when language is not allowed in contest`() {
        val contest = MockEntityFactory.contest(languages = listOf(Submission.Language.CPP_17))
        val member = MockEntityFactory.member(contest = contest)
        val problem = MockEntityFactory.problem(contest = contest)
        TestAuthentication.setMember(member)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(problems.findByIdAndContestId(problem.id, contest.id)).thenReturn(problem)

        assertThrows(ForbiddenException::class.java) {
            service.execute(
                CreateSubmissionUseCase.Command(
                    contestId = contest.id,
                    problemId = problem.id,
                    language = Submission.Language.JAVA_21,
                    code = AttachmentCommandDTO(id = IdGenerator.getUUID()),
                ),
            )
        }
    }
}
