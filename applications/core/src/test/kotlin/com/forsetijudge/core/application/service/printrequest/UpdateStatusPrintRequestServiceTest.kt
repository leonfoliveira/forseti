package com.forsetijudge.core.application.service.printrequest

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.PrintRequest
import com.forsetijudge.core.domain.event.PrintRequestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.printrequest.UpdateStatusPrintRequestUseCase
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

class UpdateStatusPrintRequestServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val printRequestRepository = mock<PrintRequestRepository>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    private val service =
        UpdateStatusPrintRequestService(
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
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(
                UpdateStatusPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    status = PrintRequest.Status.COMPLETED,
                ),
            )
        }
    }

    @Test
    fun `should throw NotFoundException when member does not exist`() {
        TestAuthentication.setMember(adminMember)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(adminMember.id, contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(
                UpdateStatusPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    status = PrintRequest.Status.COMPLETED,
                ),
            )
        }
    }

    @Test
    fun `should throw NotFoundException when print request does not exist`() {
        TestAuthentication.setMember(adminMember)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(adminMember.id, contest.id)).thenReturn(
            adminMember,
        )
        whenever(printRequestRepository.findByIdAndContestId(printRequest.id, contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(
                UpdateStatusPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    status = PrintRequest.Status.COMPLETED,
                ),
            )
        }
    }

    @Test
    fun `should throw ForbiddenException when member is not root, admin, or staff`() {
        TestAuthentication.setMember(adminMember)
        val contestantMember = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)

        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(adminMember.id, contest.id)).thenReturn(
            contestantMember,
        )
        whenever(printRequestRepository.findByIdAndContestId(printRequest.id, contest.id)).thenReturn(printRequest)

        assertThrows<ForbiddenException> {
            service.execute(
                UpdateStatusPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    status = PrintRequest.Status.COMPLETED,
                ),
            )
        }
    }

    @Test
    fun `should throw ForbiddenException when trying to change status to PENDING`() {
        TestAuthentication.setMember(adminMember)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(adminMember.id, contest.id)).thenReturn(
            adminMember,
        )
        whenever(printRequestRepository.findByIdAndContestId(printRequest.id, contest.id)).thenReturn(printRequest)

        assertThrows<ForbiddenException> {
            service.execute(
                UpdateStatusPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    status = PrintRequest.Status.PENDING,
                ),
            )
        }
    }

    @Test
    fun `should throw ForbiddenException when trying to change status of a PrintRequest that is not PENDING`() {
        TestAuthentication.setMember(adminMember)
        val completedPrintRequest = MockEntityFactory.printRequest(status = PrintRequest.Status.COMPLETED)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(adminMember.id, contest.id)).thenReturn(
            adminMember,
        )
        whenever(printRequestRepository.findByIdAndContestId(completedPrintRequest.id, contest.id)).thenReturn(
            completedPrintRequest,
        )

        assertThrows<ForbiddenException> {
            service.execute(
                UpdateStatusPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = completedPrintRequest.id,
                    status = PrintRequest.Status.COMPLETED,
                ),
            )
        }
    }

    @Test
    fun `should update print request status successfully`() {
        TestAuthentication.setMember(adminMember)
        whenever(contestRepository.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(adminMember.id, contest.id)).thenReturn(
            adminMember,
        )
        whenever(printRequestRepository.findByIdAndContestId(printRequest.id, contest.id)).thenReturn(printRequest)

        val result =
            service.execute(
                UpdateStatusPrintRequestUseCase.Command(
                    contestId = contest.id,
                    printRequestId = printRequest.id,
                    status = PrintRequest.Status.COMPLETED,
                ),
            )

        assertEquals(printRequest.id, result.id)
        assertEquals(PrintRequest.Status.COMPLETED, printRequest.status)
        verify(printRequestRepository).saveAndFlush(printRequest)
        verify(businessEventPublisher).publish(any<PrintRequestEvent.Updated>())
    }
}
