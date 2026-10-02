package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.submission.ResubmitSubmissionUseCase
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class ResubmitSubmissionServiceTest {
    private val submissions = mock<SubmissionRepository>()
    private val members = mock<MemberRepository>()
    private val events = mock<BusinessEventPublisher>()
    private val service = ResubmitSubmissionService(submissions, members, events)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `resets submission and publishes resubmitted event for judge`() {
        val contest = MockEntityFactory.contest()
        val submission =
            MockEntityFactory.submission(
                member = MockEntityFactory.member(contest = contest),
                problem = MockEntityFactory.problem(contest = contest),
                status = Submission.Status.FAILED,
            )
        val judge = MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE)
        TestAuthentication.setMember(judge)
        whenever(submissions.findByIdAndContestId(submission.id, contest.id)).thenReturn(submission)
        whenever(members.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(judge)

        val response = service.execute(ResubmitSubmissionUseCase.Command(contest.id, submission.id))

        assertEquals(Submission.Status.JUDGING, submission.status)
        assertNull(submission.answer)
        assertEquals(submission.id, response.id)
        verify(submissions).save(submission)
        verify(events).publish(SubmissionEvent.Resubmitted(submission.id))
    }

    @Test
    fun `rejects contestant and missing submission`() {
        val contest = MockEntityFactory.contest()
        val submission = MockEntityFactory.submission(problem = MockEntityFactory.problem(contest = contest))
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(submissions.findByIdAndContestId(submission.id, contest.id)).thenReturn(submission)
        whenever(members.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)
        assertThrows(ForbiddenException::class.java) {
            service.execute(ResubmitSubmissionUseCase.Command(contest.id, submission.id))
        }
        verify(submissions, never()).save(any())

        whenever(submissions.findByIdAndContestId(submission.id, contest.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(ResubmitSubmissionUseCase.Command(contest.id, submission.id))
        }
    }
}
