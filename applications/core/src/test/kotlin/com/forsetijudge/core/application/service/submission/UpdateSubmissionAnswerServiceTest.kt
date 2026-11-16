package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.submission.UpdateSubmissionAnswerUseCase
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class UpdateSubmissionAnswerServiceTest {
    private val submissions = mock<SubmissionRepository>()
    private val members = mock<MemberRepository>()
    private val events = mock<BusinessEventPublisher>()
    private val service = UpdateSubmissionAnswerService(submissions, members, events)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `updates answer for authorized judge`() {
        val contest = MockEntityFactory.contest()
        val submission = MockEntityFactory.submission(problem = MockEntityFactory.problem(contest = contest))
        val judge = MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE)
        TestAuthentication.setMember(judge)
        whenever(submissions.findByIdAndContestId(submission.id, contest.id)).thenReturn(submission)
        whenever(members.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(judge)

        val response =
            service.execute(
                UpdateSubmissionAnswerUseCase.Command(contest.id, submission.id, Submission.Answer.ACCEPTED),
            )

        assertEquals(Submission.Status.JUDGED, submission.status)
        assertEquals(Submission.Answer.ACCEPTED, response.answer)
        verify(submissions).saveAndFlush(submission)
        verify(events).publish(SubmissionEvent.Updated(submission.id))
    }

    @Test
    fun `throws NotFoundException when submission does not exist`() {
        val contest = MockEntityFactory.contest()
        val judge = MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE)
        TestAuthentication.setMember(judge)
        whenever(submissions.findByIdAndContestId(any(), any())).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(
                UpdateSubmissionAnswerUseCase.Command(
                    contest.id,
                    IdGenerator.getUUID(),
                    Submission.Answer.ACCEPTED,
                ),
            )
        }
        verify(submissions, never()).saveAndFlush(any())
        verify(events, never()).publish(any())
    }

    @Test
    fun `throws NotFoundException when member does not exist`() {
        val contest = MockEntityFactory.contest()
        val submission = MockEntityFactory.submission(problem = MockEntityFactory.problem(contest = contest))
        val judge = MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE)
        TestAuthentication.setMember(judge)
        whenever(submissions.findByIdAndContestId(submission.id, contest.id)).thenReturn(submission)
        whenever(members.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(
                UpdateSubmissionAnswerUseCase.Command(
                    contest.id,
                    submission.id,
                    Submission.Answer.ACCEPTED,
                ),
            )
        }
        verify(submissions, never()).saveAndFlush(any())
        verify(events, never()).publish(any())
    }

    @Test
    fun `throws ForbiddenException when member is not a judge`() {
        val contest = MockEntityFactory.contest()
        val submission =
            MockEntityFactory.submission(
                member = MockEntityFactory.member(contest = contest),
                problem = MockEntityFactory.problem(contest = contest),
                status = Submission.Status.FAILED,
            )
        val contestant = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        TestAuthentication.setMember(contestant)
        whenever(submissions.findByIdAndContestId(submission.id, contest.id)).thenReturn(submission)
        whenever(members.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)

        assertThrows(ForbiddenException::class.java) {
            service.execute(
                UpdateSubmissionAnswerUseCase.Command(
                    contest.id,
                    submission.id,
                    Submission.Answer.ACCEPTED,
                ),
            )
        }
        verify(submissions, never()).saveAndFlush(any())
        verify(events, never()).publish(any())
    }

    @Test
    fun `throws ForbiddenException when member does not belong to contest`() {
        val contest = MockEntityFactory.contest()
        val submission =
            MockEntityFactory.submission(
                member = MockEntityFactory.member(contest = contest),
                problem = MockEntityFactory.problem(contest = contest),
                status = Submission.Status.FAILED,
            )
        val judge = MockEntityFactory.member(type = Member.Type.JUDGE, contest = MockEntityFactory.contest())
        TestAuthentication.setMember(judge)
        whenever(submissions.findByIdAndContestId(submission.id, contest.id)).thenReturn(submission)
        whenever(members.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(judge)

        assertThrows(ForbiddenException::class.java) {
            service.execute(
                UpdateSubmissionAnswerUseCase.Command(
                    contest.id,
                    submission.id,
                    Submission.Answer.ACCEPTED,
                ),
            )
        }
        verify(submissions, never()).saveAndFlush(any())
        verify(events, never()).publish(any())
    }

    @Test
    fun `throws ForbiddenException when member is not a root, judge or admin`() {
        val contest = MockEntityFactory.contest()
        val submission =
            MockEntityFactory.submission(
                member = MockEntityFactory.member(contest = contest),
                problem = MockEntityFactory.problem(contest = contest),
                status = Submission.Status.FAILED,
            )
        val staff = MockEntityFactory.member(contest = contest, type = Member.Type.STAFF)
        TestAuthentication.setMember(staff)
        whenever(submissions.findByIdAndContestId(submission.id, contest.id)).thenReturn(submission)
        whenever(members.findByIdAndContestIdOrContestIsNull(staff.id, contest.id)).thenReturn(staff)

        assertThrows(ForbiddenException::class.java) {
            service.execute(
                UpdateSubmissionAnswerUseCase.Command(
                    contest.id,
                    submission.id,
                    Submission.Answer.ACCEPTED,
                ),
            )
        }
        verify(submissions, never()).saveAndFlush(any())
        verify(events, never()).publish(any())
    }
}
