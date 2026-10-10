package com.forsetijudge.core.application.service.announcement

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.announcement.CreateAnnouncementUseCase
import com.forsetijudge.core.port.output.repository.AnnouncementRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class CreateAnnouncementServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val announcementRepository = mock<AnnouncementRepository>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    private val service =
        CreateAnnouncementService(
            contestRepository,
            memberRepository,
            announcementRepository,
            businessEventPublisher,
        )

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    private val command =
        CreateAnnouncementUseCase.Command(contestId = IdGenerator.getUUID(), text = "New announcement")

    @Test
    fun `creates announcement for contest and publishes event`() {
        val contest = MockEntityFactory.contest(id = command.contestId)
        val member = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)

        val response = service.execute(command)

        verify(announcementRepository).save(any())
        verify(businessEventPublisher).publish(
            org.mockito.kotlin.check { event ->
                assertEquals(AnnouncementEvent.Created(response.id), event)
            },
        )
        assertEquals(command.text, response.text)
    }

    @Test
    fun `throws NotFoundException when contest does not exist`() {
        val member = MockEntityFactory.member(type = Member.Type.ADMIN)
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
        val contest = MockEntityFactory.contest(id = command.contestId)
        val member = MockEntityFactory.member(type = Member.Type.ADMIN)
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(null)

        val exception =
            assertThrows<NotFoundException> {
                service.execute(command)
            }

        assertEquals("Could not find member with id = ${member.id} in this contest", exception.message)
    }

    @Test
    fun `throws NotFoundException when member does not belong to contest`() {
        val contest = MockEntityFactory.contest(id = command.contestId)
        val member = MockEntityFactory.member(type = Member.Type.ADMIN)
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(null)

        val exception =
            assertThrows<NotFoundException> {
                service.execute(command)
            }

        assertEquals(
            "Could not find member with id = ${member.id} in this contest",
            exception.message,
        )
    }

    @Test
    fun `throws ForbiddenException when member is not admin or root`() {
        val contest = MockEntityFactory.contest(id = command.contestId)
        val member = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)

        val exception =
            assertThrows<ForbiddenException> {
                service.execute(command)
            }

        assertEquals("Member type ${member.type} is not allowed to perform this action", exception.message)
    }
}
