package com.forsetijudge.core.application.service.printrequest

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.PrintRequestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.printrequest.UpdateIsCompletedPrintRequestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.PrintRequestRepository
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class UpdateIsCompletedPrintRequestServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val printRequestRepository = mock<PrintRequestRepository>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    private val service =
        UpdateIsCompletedPrintRequestService(
            contestRepository,
            memberRepository,
            printRequestRepository,
            businessEventPublisher,
        )

    val contest =
        MockEntityFactory.contest(startAt = OffsetDateTime.now().minusDays(1), endAt = OffsetDateTime.now().plusDays(1))
    val adminMember = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)
    val printRequest = MockEntityFactory.printRequest()

    @Test
    fun `should throw NotFoundException when contest does not exist`() {
        TestAuthentication.setMember(adminMember)
        whenever(contestRepository.findById(contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(
                UpdateIsCompletedPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    isCompleted = true,
                ),
            )
        }
    }

    @Test
    fun `should throw NotFoundException when member does not exist`() {
        TestAuthentication.setMember(adminMember)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestId(adminMember.id, contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(
                UpdateIsCompletedPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    isCompleted = true,
                ),
            )
        }
    }

    @Test
    fun `should throw NotFoundException when print request does not exist`() {
        TestAuthentication.setMember(adminMember)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestId(adminMember.id, contest.id)).thenReturn(adminMember)
        whenever(printRequestRepository.findByIdAndContestId(printRequest.id, contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(
                UpdateIsCompletedPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    isCompleted = true,
                ),
            )
        }
    }

    @Test
    fun `should throw ForbiddenException when member is not root, admin, or staff`() {
        TestAuthentication.setMember(adminMember)
        val contestantMember = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)

        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestId(adminMember.id, contest.id)).thenReturn(contestantMember)
        whenever(printRequestRepository.findByIdAndContestId(printRequest.id, contest.id)).thenReturn(printRequest)

        assertThrows<ForbiddenException> {
            service.execute(
                UpdateIsCompletedPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    isCompleted = true,
                ),
            )
        }
    }

    @Test
    fun `should update print request isCompleted successfully`() {
        TestAuthentication.setMember(adminMember)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestId(adminMember.id, contest.id)).thenReturn(adminMember)
        whenever(printRequestRepository.findByIdAndContestId(printRequest.id, contest.id)).thenReturn(printRequest)

        val result =
            service.execute(
                UpdateIsCompletedPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    isCompleted = true,
                ),
            )

        assertEquals(printRequest.id, result.id)
        assertEquals(true, printRequest.isCompleted)
        verify(printRequestRepository).save(printRequest)
        verify(businessEventPublisher).publish(any<PrintRequestEvent.Updated>())
    }
}
