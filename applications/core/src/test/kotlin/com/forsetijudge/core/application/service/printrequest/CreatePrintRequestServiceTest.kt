package com.forsetijudge.core.application.service.printrequest

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.PrintRequest
import com.forsetijudge.core.domain.event.PrintRequestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.printrequest.CreatePrintRequestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.PrintRequestRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import java.time.OffsetDateTime
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class CreatePrintRequestServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val printRequestRepository = mock<PrintRequestRepository>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    private val service =
        CreatePrintRequestService(
            contestRepository,
            memberRepository,
            submissionRepository,
            printRequestRepository,
            businessEventPublisher,
        )

    val contest =
        MockEntityFactory.contest(startAt = OffsetDateTime.now().minusDays(1), endAt = OffsetDateTime.now().plusDays(1))
    val member = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
    val submission = MockEntityFactory.submission(member = member)

    @Test
    fun `should throw NotFoundException when contest does not exist`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(CreatePrintRequestUseCase.Command(contestId = contest.id, submissionId = submission.id))
        }
    }

    @Test
    fun `should throw NotFoundException when member does not exist`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(CreatePrintRequestUseCase.Command(contestId = contest.id, submissionId = submission.id))
        }
    }

    @Test
    fun `should throw NotFoundException when submission does not exist`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(submissionRepository.findByIdAndContestId(submission.id, contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(CreatePrintRequestUseCase.Command(contestId = contest.id, submissionId = submission.id))
        }
    }

    @Test
    fun `should throw ForbiddenException when contest has ended`() {
        TestAuthentication.setMember(member)
        val endedContest = MockEntityFactory.contest(endAt = OffsetDateTime.now().minusDays(1))
        whenever(contestRepository.findById(endedContest.id)).thenReturn(endedContest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, endedContest.id)).thenReturn(
            MockEntityFactory.member(type = Member.Type.CONTESTANT, contest = endedContest),
        )
        whenever(submissionRepository.findByIdAndContestId(submission.id, endedContest.id)).thenReturn(
            MockEntityFactory.submission(member = member),
        )

        assertThrows<ForbiddenException> {
            service.execute(
                CreatePrintRequestUseCase.Command(
                    contestId = endedContest.id,
                    submissionId = submission.id,
                ),
            )
        }
    }

    @Test
    fun `should throw ForbiddenException when submission does not belong to member`() {
        TestAuthentication.setMember(member)
        val otherMember = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        val otherSubmission = MockEntityFactory.submission(member = otherMember)

        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(submissionRepository.findByIdAndContestId(submission.id, contest.id)).thenReturn(otherSubmission)

        assertThrows<ForbiddenException> {
            service.execute(
                CreatePrintRequestUseCase.Command(
                    contestId = contest.id,
                    submissionId = otherSubmission.id,
                ),
            )
        }
    }

    @Test
    fun `should create print request successfully`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(submissionRepository.findByIdAndContestId(submission.id, contest.id)).thenReturn(submission)

        val result =
            service.execute(CreatePrintRequestUseCase.Command(contestId = contest.id, submissionId = submission.id))

        assertNotNull(result.id)
        verify(printRequestRepository).save(any<PrintRequest>())
        verify(businessEventPublisher).publish(any<PrintRequestEvent.Created>())
    }
}
