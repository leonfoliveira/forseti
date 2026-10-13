package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.clarification.PublishClarificationUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class PublishClarificationServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val clarificationRepository = mock<ClarificationRepository>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    private val service =
        PublishClarificationService(
            contestRepository,
            memberRepository,
            clarificationRepository,
            businessEventPublisher,
        )

    val contest = MockEntityFactory.contest()
    val member = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)
    val clarification = MockEntityFactory.clarification()
    val command =
        PublishClarificationUseCase.Command(
            contestId = contest.id,
            clarificationId = clarification.id,
        )

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
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, command.contestId)).thenReturn(null)

        val exception =
            assertThrows<NotFoundException> {
                service.execute(command)
            }

        assertEquals("Could not find member with id = ${member.id} in this contest", exception.message)
    }

    @Test
    fun `throws NotFoundException when clarification does not exist in contest`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(command.contestId)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, command.contestId)).thenReturn(member)
        whenever(clarificationRepository.findByIdAndContestId(command.clarificationId, command.contestId)).thenReturn(
            null,
        )

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
        val nonAdminMember = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        TestAuthentication.setMember(nonAdminMember)
        whenever(contestRepository.findById(command.contestId)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(nonAdminMember.id, command.contestId)).thenReturn(
            nonAdminMember,
        )
        whenever(clarificationRepository.findByIdAndContestId(command.clarificationId, command.contestId)).thenReturn(
            clarification,
        )

        val exception =
            assertThrows<ForbiddenException> {
                service.execute(command)
            }

        assertEquals("Member type ${nonAdminMember.type} is not allowed to perform this action", exception.message)
    }

    @Test
    fun `saves clarification and publishes event when member is ROOT or ADMIN`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(command.contestId)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, command.contestId)).thenReturn(member)
        whenever(clarificationRepository.findByIdAndContestId(command.clarificationId, command.contestId)).thenReturn(
            clarification,
        )

        service.execute(command)

        assertEquals(true, clarification.isPublic)
        verify(clarificationRepository).save(clarification)
        verify(businessEventPublisher).publish(ClarificationEvent.Published(clarification.id))
    }
}
