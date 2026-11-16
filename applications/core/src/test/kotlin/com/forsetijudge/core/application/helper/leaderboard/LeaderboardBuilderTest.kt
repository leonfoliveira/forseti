package com.forsetijudge.core.application.helper.leaderboard

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.output.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.output.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class LeaderboardBuilderTest {
    private val memberRepository = mock<MemberRepository>()
    private val submissionRepository = mock<SubmissionRepository>()
    private val frozenSubmissionRepository = mock<FrozenSubmissionRepository>()
    private val leaderboardCellBuilder = mock<LeaderboardCellBuilder>()
    private val leaderboardCacheStore = mock<LeaderboardCacheStore>()
    private val leaderboardBuilder =
        LeaderboardBuilder(
            memberRepository,
            submissionRepository,
            frozenSubmissionRepository,
            leaderboardCellBuilder,
            leaderboardCacheStore,
        )

    @Test
    fun `should build leaderboard for not frozen contest without cache`() {
        val now = OffsetDateTime.now()

        val contest = MockEntityFactory.contest(startAt = now.minusHours(3))
        val problem = MockEntityFactory.problem(contest = contest)
        contest.problems = listOf(problem)

        val member1 = MockEntityFactory.member(contest = contest, name = "E")
        val member2 = MockEntityFactory.member(contest = contest, name = "D")
        val member3 = MockEntityFactory.member(contest = contest, name = "C")
        val member4 = MockEntityFactory.member(contest = contest, name = "B")
        val member5 = MockEntityFactory.member(contest = contest, name = "A")

        val cell1 = MockModelFactory.leaderboardCell(isAccepted = false, memberId = member1.id, problemId = problem.id)
        val cell2 =
            MockModelFactory.leaderboardCell(
                isAccepted = true,
                penalty = 10,
                memberId = member2.id,
                problemId = problem.id,
            )
        val cell3 =
            MockModelFactory.leaderboardCell(
                isAccepted = true,
                penalty = 1,
                acceptedAt = now.minusHours(1),
                memberId = member3.id,
                problemId = problem.id,
            )
        val cell4 =
            MockModelFactory.leaderboardCell(
                isAccepted = true,
                penalty = 1,
                acceptedAt = now.minusHours(2),
                memberId = member4.id,
                problemId = problem.id,
            )
        val cell5 =
            MockModelFactory.leaderboardCell(
                isAccepted = true,
                penalty = 1,
                acceptedAt = now.minusHours(2),
                memberId = member5.id,
                problemId = problem.id,
            )

        whenever(
            memberRepository.findAllByContestIdAndTypeIn(
                contest.id,
                setOf(Member.Type.CONTESTANT, Member.Type.UNOFFICIAL_CONTESTANT),
            ),
        ).thenReturn(listOf(member1, member2, member3, member4, member5))
        whenever(leaderboardCacheStore.getAllCellsByContestId(contest.id)).thenReturn(emptyList())
        whenever(
            submissionRepository.findByContestIdAndStatusAndMemberAndProblemPairsNotIn(
                any(),
                any(),
                any(),
            ),
        ).thenReturn(emptyList())

        whenever(leaderboardCellBuilder.build(contest, member1, problem, emptyList())).thenReturn(cell1)
        whenever(leaderboardCellBuilder.build(contest, member2, problem, emptyList())).thenReturn(cell2)
        whenever(leaderboardCellBuilder.build(contest, member3, problem, emptyList())).thenReturn(cell3)
        whenever(leaderboardCellBuilder.build(contest, member4, problem, emptyList())).thenReturn(cell4)
        whenever(leaderboardCellBuilder.build(contest, member5, problem, emptyList())).thenReturn(cell5)

        val leaderboard = leaderboardBuilder.build(contest)

        assertEquals(
            Leaderboard(
                contestId = contest.id,
                contestStartAt = contest.startAt,
                rows =
                    listOf(
                        Leaderboard.Row(
                            memberId = member5.id,
                            memberName = member5.name,
                            memberType = member5.type,
                            score = 1,
                            penalty = 1,
                            cells = listOf(cell5),
                        ),
                        Leaderboard.Row(
                            memberId = member4.id,
                            memberName = member4.name,
                            memberType = member4.type,
                            score = 1,
                            penalty = 1,
                            cells = listOf(cell4),
                        ),
                        Leaderboard.Row(
                            memberId = member3.id,
                            memberName = member3.name,
                            memberType = member3.type,
                            score = 1,
                            penalty = 1,
                            cells = listOf(cell3),
                        ),
                        Leaderboard.Row(
                            memberId = member2.id,
                            memberName = member2.name,
                            memberType = member2.type,
                            score = 1,
                            penalty = 10,
                            cells = listOf(cell2),
                        ),
                        Leaderboard.Row(
                            memberId = member1.id,
                            memberName = member1.name,
                            memberType = member1.type,
                            score = 0,
                            penalty = 0,
                            cells = listOf(cell1),
                        ),
                    ),
            ),
            leaderboard,
        )
    }
}
