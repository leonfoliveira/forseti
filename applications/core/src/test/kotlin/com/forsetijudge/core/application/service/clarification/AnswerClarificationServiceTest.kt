package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.clarification.AnswerClarificationUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.mock
import org.mockito.kotlin.check
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class AnswerClarificationServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val clarificationRepository = mock<ClarificationRepository>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    private val service =
        AnswerClarificationService(contestRepository, memberRepository, clarificationRepository, businessEventPublisher)

    val command =
        AnswerClarificationUseCase.Command(
            contestId = IdGenerator.getUUID(),
            clarificationId = IdGenerator.getUUID(),
            text = "This is the answer to the clarification.",
        )
    val member = MockEntityFactory.member()

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `throws NotFoundException when contest does not exist`() {
        val member = MockEntityFactory.member()
        TestAuthentication.setMember(member)
        whenever(contestRepository.findByIdNullable(command.contestId)).thenReturn(null)

        val exception =
            assertThrows<NotFoundException> {
                service.execute(command)
            }

        assertEquals("Could not find contest with id = ${command.contestId}", exception.message)
    }

    @Test
    fun `throws NotFoundException when member does not exist in contest`() {
        val member = MockEntityFactory.member()
        TestAuthentication.setMember(member)
        val contest = MockEntityFactory.contest(id = command.contestId)
        whenever(contestRepository.findByIdNullable(command.contestId)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(null)

        val exception =
            assertThrows<NotFoundException> {
                service.execute(command)
            }

        assertEquals("Could not find member with id = ${member.id} in this contest", exception.message)
    }

    @Test
    fun `throws NotFoundException when clarification does not exist in contest`() {
        val member = MockEntityFactory.member()
        TestAuthentication.setMember(member)
        val contest = MockEntityFactory.contest(id = command.contestId)
        whenever(contestRepository.findByIdNullable(command.contestId)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(clarificationRepository.findByIdAndContestId(command.clarificationId, contest.id)).thenReturn(null)

        val exception =
            assertThrows<NotFoundException> {
                service.execute(command)
            }

        assertEquals(
            "Could not find clarification with id = ${command.clarificationId} for contest with id = ${command.contestId}",
            exception.message,
        )
    }

    @Test
    fun `throws ForbiddenException when member is not ROOT or ADMIN`() {
        val contest = MockEntityFactory.contest(id = command.contestId)
        val member = MockEntityFactory.member(type = Member.Type.CONTESTANT, contest = contest)
        TestAuthentication.setMember(member)
        whenever(contestRepository.findByIdNullable(command.contestId)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(clarificationRepository.findByIdAndContestId(command.clarificationId, contest.id)).thenReturn(
            MockEntityFactory.clarification(contest = contest),
        )

        val exception =
            assertThrows<ForbiddenException> {
                service.execute(command)
            }

        assertEquals(
            "Member type ${member.type} is not allowed to perform this action",
            exception.message,
        )
    }

    @Test
    fun `throws ForbiddenException when clarification has already been answered`() {
        val contest = MockEntityFactory.contest(id = command.contestId)
        val member = MockEntityFactory.member(type = Member.Type.ADMIN, contest = contest)
        val clarification =
            MockEntityFactory.clarification(
                contest = contest,
                answer = Clarification.Answer(member = member, text = "Already answered"),
            )
        TestAuthentication.setMember(member)
        whenever(contestRepository.findByIdNullable(command.contestId)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(clarificationRepository.findByIdAndContestId(command.clarificationId, contest.id)).thenReturn(
            clarification,
        )

        val exception =
            assertThrows<ForbiddenException> {
                service.execute(command)
            }

        assertEquals(
            "Clarification with id = ${command.clarificationId} has already been answered",
            exception.message,
        )
    }

    @Test
    fun `saves the answer to the clarification when all conditions are met and publishes event`() {
        val contest = MockEntityFactory.contest(id = command.contestId)
        val member = MockEntityFactory.member(type = Member.Type.ADMIN, contest = contest)
        val clarification = MockEntityFactory.clarification(contest = contest, answer = null)
        TestAuthentication.setMember(member)
        whenever(contestRepository.findByIdNullable(command.contestId)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)
        whenever(clarificationRepository.findByIdAndContestId(command.clarificationId, contest.id)).thenReturn(
            clarification,
        )

        service.execute(command)

        assertEquals(command.text, clarification.answer?.text)
        verify(businessEventPublisher).publish(
            check { event ->
                assertEquals(ClarificationEvent.Answered(clarification.id), event)
            },
        )
    }
}
