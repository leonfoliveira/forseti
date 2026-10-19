package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.contest.UnfreezeContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.argThat
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class UnfreezeContestServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    val service = UnfreezeContestService(contestRepository, memberRepository, businessEventPublisher)

    val contest =
        MockEntityFactory.contest(freezeAt = OffsetDateTime.now().minusDays(1))
    val member = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)

    @Test
    fun `should throw NotFoundException when contest does not exist`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(UnfreezeContestUseCase.Command(contestId = contest.id))
        }
    }

    @Test
    fun `should throw NotFoundException when member does not exist`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(UnfreezeContestUseCase.Command(contestId = contest.id))
        }
    }

    @Test
    fun `should throw ForbiddenException when member does not belongs to contest`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(
            MockEntityFactory.member(type = Member.Type.ADMIN, contest = MockEntityFactory.contest()),
        )

        assertThrows<ForbiddenException> {
            service.execute(UnfreezeContestUseCase.Command(contestId = contest.id))
        }
    }

    @Test
    fun `should throw ForbiddenException when member is not admin or root`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(
            MockEntityFactory.member(type = Member.Type.CONTESTANT, contest = contest),
        )

        assertThrows<ForbiddenException> {
            service.execute(UnfreezeContestUseCase.Command(contestId = contest.id))
        }
    }

    @Test
    fun `should throw ForbiddenException when contest is not frozen`() {
        TestAuthentication.setMember(member)
        val unfrozenContest = MockEntityFactory.contest(freezeAt = null)
        whenever(contestRepository.findById(unfrozenContest.id)).thenReturn(unfrozenContest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, unfrozenContest.id)).thenReturn(
            MockEntityFactory.member(type = Member.Type.ADMIN, contest = unfrozenContest),
        )

        assertThrows<ForbiddenException> {
            service.execute(UnfreezeContestUseCase.Command(contestId = unfrozenContest.id))
        }
    }

    @Test
    fun `should unfreeze contest successfully`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)

        val result = service.execute(UnfreezeContestUseCase.Command(contestId = contest.id))

        assertEquals(contest.id, result.id)
        assertFalse(contest.isFrozen())
        verify(contestRepository).save(contest)
        verify(businessEventPublisher).publish(
            argThat {
                this is ContestEvent.Unfrozen && this.contestId == contest.id
            },
        )
    }
}
