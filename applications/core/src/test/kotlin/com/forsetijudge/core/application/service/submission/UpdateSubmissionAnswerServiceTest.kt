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
        verify(submissions).save(submission)
        verify(events).publish(SubmissionEvent.Updated(submission.id))
    }

    @Test
    fun `fails when submission is absent or actor is not jury`() {
        val contest = MockEntityFactory.contest()
        val submission = MockEntityFactory.submission(problem = MockEntityFactory.problem(contest = contest))
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(submissions.findByIdAndContestId(submission.id, contest.id)).thenReturn(submission)
        whenever(members.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)
        assertThrows(ForbiddenException::class.java) {
            service.execute(
                UpdateSubmissionAnswerUseCase.Command(contest.id, submission.id, Submission.Answer.ACCEPTED),
            )
        }
        verify(submissions, never()).save(any())

        whenever(submissions.findByIdAndContestId(submission.id, contest.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(
                UpdateSubmissionAnswerUseCase.Command(contest.id, submission.id, Submission.Answer.ACCEPTED),
            )
        }
    }
}
