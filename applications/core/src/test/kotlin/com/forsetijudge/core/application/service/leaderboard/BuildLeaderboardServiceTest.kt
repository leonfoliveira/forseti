package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.IdGenerator
import java.time.OffsetDateTime
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class BuildLeaderboardServiceTest {
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val builder = mock<LeaderboardBuilder>()
    private val service = BuildLeaderboardService(contests, members, builder)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `allows staff to view upcoming leaderboard`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1))
        val judge = MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE)
        TestAuthentication.setMember(judge)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(judge)
        val leaderboard = MockModelFactory.leaderboard(contestId = contest.id)
        whenever(builder.build(contest)).thenReturn(leaderboard)

        val result = service.execute(BuildLeaderboardUseCase.Command(contest.id))

        assertEquals(contest.id, result.contestId)
        verify(builder).build(contest)
    }

    @Test
    fun `throws NotFoundException when contest does not exist`() {
        val contestId = IdGenerator.getUUID()
        TestAuthentication.setMember(MockEntityFactory.member())
        whenever(contests.findByIdNullable(contestId)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(BuildLeaderboardUseCase.Command(contestId))
        }
    }

    @Test
    fun `throws NotFoundException when member does not exist in contest`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(member)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            service.execute(BuildLeaderboardUseCase.Command(contest.id))
        }
        verify(builder, never()).build(contest)
    }

    @Test
    fun `throws ForbiddenException when member does not belong to contest`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(type = Member.Type.JUDGE, contest = MockEntityFactory.contest())
        TestAuthentication.setMember(member)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(member.id, contest.id)).thenReturn(member)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildLeaderboardUseCase.Command(contest.id))
        }
        verify(builder, never()).build(contest)
    }

    @Test
    fun `throws ForbiddenException when contest has not started and member cannot access not started contest`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusDays(1))
        val judge = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        TestAuthentication.setMember(judge)
        whenever(contests.findByIdNullable(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(judge.id, contest.id)).thenReturn(judge)

        assertThrows(ForbiddenException::class.java) {
            service.execute(BuildLeaderboardUseCase.Command(contest.id))
        }
        verify(builder, never()).build(contest)
    }
}
