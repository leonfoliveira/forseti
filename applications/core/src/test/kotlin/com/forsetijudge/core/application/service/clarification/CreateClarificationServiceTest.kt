package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.clarification.CreateClarificationUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.ProblemRepository
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.mock
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.OffsetDateTime

class CreateClarificationServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val problemRepository = mock<ProblemRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val clarificationRepository = mock<ClarificationRepository>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    private val service =
        CreateClarificationService(
            contestRepository,
            problemRepository,
            memberRepository,
            clarificationRepository,
            businessEventPublisher,
        )

    private val contest = MockEntityFactory.contest()
    private val command =
        CreateClarificationUseCase.Command(
            contestId = IdGenerator.getUUID(),
            problemId = IdGenerator.getUUID(),
            text = "Clarification text",
        )
    private val member = MockEntityFactory.member(contest = contest)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `throws NotFoundException when contest does not exist`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(command.contestId)).thenReturn(null)

        val exception =
            assertThrows<NotFoundException> {
                service.execute(command)
            }

        assertEquals("Could not find contest with id = ${command.contestId}", exception.message)
    }

    @Test
    fun `throws NotFoundException when member does not exist in contest`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(command.contestId)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(null)

        val exception =
            assertThrows<NotFoundException> {
                service.execute(command)
            }

        assertEquals("Could not find member with id = ${member.id} in this contest", exception.message)
    }

    @Test
    fun `throws NotFoundException when problem does not exist in contest`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(command.contestId)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, command.contestId)).thenReturn(member)
        whenever(problemRepository.findByIdAndContestId(command.problemId!!, contest.id)).thenReturn(null)

        val exception =
            assertThrows<NotFoundException> {
                service.execute(command)
            }

        assertEquals("Could not find problem with id = ${command.problemId} in this contest", exception.message)
    }

    @Test
    fun `throws ForbiddenException when member is not CONTESTANT`() {
        val nonContestantMember = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)
        TestAuthentication.setMember(nonContestantMember)
        whenever(contestRepository.findById(command.contestId)).thenReturn(contest)
        whenever(
            memberRepository.findByIdAndContestIdOrContestIsNull(
                nonContestantMember.id,
                command.contestId,
            ),
        ).thenReturn(
            nonContestantMember,
        )

        val exception =
            assertThrows<Exception> {
                service.execute(command.copy(problemId = null))
            }

        assertEquals(
            "Member type ${nonContestantMember.type} is not allowed to perform this action",
            exception.message,
        )
    }

    @Test
    fun `throws ForbiddenException when contest is not active`() {
        val inactiveContest =
            MockEntityFactory.contest(
                startAt = OffsetDateTime.now().plusDays(1),
                endAt = OffsetDateTime.now().plusDays(2),
            )
        val memberInInactiveContest = MockEntityFactory.member(contest = inactiveContest, type = Member.Type.CONTESTANT)
        TestAuthentication.setMember(memberInInactiveContest)
        whenever(contestRepository.findById(any())).thenReturn(inactiveContest)
        whenever(
            memberRepository.findByIdAndContestIdOrContestIsNull(
                memberInInactiveContest.id,
                inactiveContest.id,
            ),
        ).thenReturn(
            memberInInactiveContest,
        )

        val exception =
            assertThrows<Exception> {
                service.execute(command.copy(contestId = inactiveContest.id, problemId = null))
            }

        assertEquals(
            "Contest is not active",
            exception.message,
        )
    }

    @Test
    fun `saves clarification and publishes event when all conditions are met`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(any())).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(any(), any())).thenReturn(member)
        whenever(problemRepository.findByIdAndContestId(any(), any())).thenReturn(
            MockEntityFactory.problem(id = command.problemId!!, contest = contest),
        )

        service.execute(command)

        val savedClarificationCaptor = argumentCaptor<Clarification>()
        verify(clarificationRepository).save(savedClarificationCaptor.capture())
        val savedClarification = savedClarificationCaptor.firstValue
        assertEquals(command.text, savedClarification.text)
        assertEquals(contest, savedClarification.contest)
        assertEquals(member, savedClarification.member)
        assertEquals(command.problemId, savedClarification.problem?.id)

        verify(businessEventPublisher).publish(
            ClarificationEvent.Created(savedClarification.id),
        )
    }
}
