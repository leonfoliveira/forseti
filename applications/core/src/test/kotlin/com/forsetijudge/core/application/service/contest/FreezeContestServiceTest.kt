package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.FrozenSubmission
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.contest.FreezeContestUseCase
import com.forsetijudge.core.port.output.queue.FreezeQueueProducer
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.argThat
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class FreezeContestServiceTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberRepository = mock<MemberRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val frozenSubmissionRepository = mock<FrozenSubmissionRepository>()
    private val freezeQueueProducer = mock<FreezeQueueProducer>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    private val service =
        FreezeContestService(
            contestRepository,
            memberRepository,
            submissionRepository,
            frozenSubmissionRepository,
            freezeQueueProducer,
            businessEventPublisher,
        )

    val contest =
        MockEntityFactory.contest(startAt = OffsetDateTime.now().minusDays(1), endAt = OffsetDateTime.now().plusDays(1))
    val member = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)
    val submission = MockEntityFactory.submission()

    @Test
    fun `should throw NotFoundException when contest does not exist`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(FreezeContestUseCase.Command(contestId = contest.id))
        }
    }

    @Test
    fun `should throw NotFoundException when member does not exist`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(FreezeContestUseCase.Command(contestId = contest.id))
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
            service.execute(FreezeContestUseCase.Command(contestId = contest.id))
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
            service.execute(FreezeContestUseCase.Command(contestId = contest.id))
        }
    }

    @Test
    fun `should throw ForbiddenException when contest has ended`() {
        TestAuthentication.setMember(member)
        val endedContest = MockEntityFactory.contest(endAt = OffsetDateTime.now().minusDays(1))
        whenever(contestRepository.findById(endedContest.id)).thenReturn(endedContest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, endedContest.id)).thenReturn(
            MockEntityFactory.member(type = Member.Type.ADMIN, contest = endedContest),
        )

        assertThrows<ForbiddenException> {
            service.execute(FreezeContestUseCase.Command(contestId = endedContest.id))
        }
    }

    @Test
    fun `should throw ForbiddenException when contest is already frozen`() {
        TestAuthentication.setMember(member)
        val frozenContest = MockEntityFactory.contest(freezeAt = OffsetDateTime.now().minusDays(1))
        whenever(contestRepository.findById(frozenContest.id)).thenReturn(frozenContest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, frozenContest.id)).thenReturn(
            MockEntityFactory.member(type = Member.Type.ADMIN, contest = frozenContest),
        )

        assertThrows<ForbiddenException> {
            service.execute(FreezeContestUseCase.Command(contestId = frozenContest.id))
        }
    }

    @Test
    fun `should freeze contest successfully`() {
        TestAuthentication.setMember(member)
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(
            MockEntityFactory.member(type = Member.Type.ADMIN, contest = contest),
        )
        whenever(submissionRepository.findAllByContestId(contest.id)).thenReturn(listOf(submission))

        val result = service.execute(FreezeContestUseCase.Command(contestId = contest.id))

        assertEquals(contest.id, result.id)
        assertTrue(result.isFrozen)
        verify(frozenSubmissionRepository).saveAll(
            argThat<List<FrozenSubmission>> { it ->
                it.size == 1 && it[0].id == submission.id
            },
        )
        verify(contestRepository).save(contest)
        verify(freezeQueueProducer).cancel(contestId = contest.id)
        verify(businessEventPublisher).publish(ContestEvent.Frozen(contestId = contest.id))
    }

    @Test
    fun `should freeze contest successfully when bypassing member authorization`() {
        whenever(contestRepository.findById(contest.id)).thenReturn(contest)
        whenever(submissionRepository.findAllByContestId(contest.id)).thenReturn(listOf(submission))

        val result =
            service.execute(FreezeContestUseCase.Command(contestId = contest.id, bypassMemberAuthorization = true))

        assertEquals(contest.id, result.id)
        assertTrue(result.isFrozen)
        verify(frozenSubmissionRepository).saveAll(
            argThat<List<FrozenSubmission>> { it ->
                it.size == 1 && it[0].id == submission.id
            },
        )
        verify(contestRepository).save(contest)
        verify(freezeQueueProducer).cancel(contestId = contest.id)
        verify(businessEventPublisher).publish(ContestEvent.Frozen(contestId = contest.id))
    }
}
