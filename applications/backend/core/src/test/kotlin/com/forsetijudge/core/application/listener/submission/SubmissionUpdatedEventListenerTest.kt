package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.application.service.internal.leaderboard.LeaderboardCellBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driven.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime

class SubmissionUpdatedEventListenerTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val leaderboardCellBuilder = mockk<LeaderboardCellBuilder>(relaxed = true)
        val leaderboardCacheStore = mockk<LeaderboardCacheStore>(relaxed = true)
        val broadcastProducer = mockk<BroadcastProducer>(relaxed = true)

        val sut =
            SubmissionUpdatedEventListener(
                submissionRepository = submissionRepository,
                leaderboardCellBuilder = leaderboardCellBuilder,
                broadcastProducer = broadcastProducer,
                leaderboardCacheStore = leaderboardCacheStore,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val submission = SubmissionMockBuilder.build()
            val leaderboardCell = LeaderboardMockBuilder.buildCell()
            val event = SubmissionEvent.Updated(submission.id)
            every { submissionRepository.findById(submission.id) } returns submission
            every {
                submissionRepository.findAllByMemberIdAndProblemIdAndStatus(
                    submission.member.id,
                    submission.problem.id,
                    Submission.Status.JUDGED,
                )
            } returns listOf(submission)
            every {
                leaderboardCellBuilder.build(
                    submission.contest,
                    submission.member,
                    submission.problem,
                    listOf(submission),
                )
            } returns leaderboardCell

            sut.handle(event)

            verify { broadcastProducer.produce(AdminDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission)) }
            verify { broadcastProducer.produce(JudgeDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission)) }
            verify { broadcastProducer.produce(StaffDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission)) }
            verify {
                broadcastProducer.produce(
                    ContestantPrivateBroadcastRoom(submission.contest.id, submission.member.id).buildSubmissionUpdatedEvent(submission),
                )
            }
            verify {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission),
                )
            }
            verify { broadcastProducer.produce(GuestDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission)) }
            verify {
                broadcastProducer.produce(
                    AdminDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify {
                broadcastProducer.produce(
                    GuestDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify {
                broadcastProducer.produce(
                    JudgeDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify {
                broadcastProducer.produce(
                    StaffDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify { leaderboardCacheStore.cacheCell(submission.contest.id, leaderboardCell) }
        }

        test("should not produce to submission topic and leaderboard cell topic if contest is frozen") {
            val contest =
                ContestMockBuilder.build(
                    frozenAt = OffsetDateTime.now().minusHours(1),
                )
            val problem = ProblemMockBuilder.build(contest = contest)
            val submission = SubmissionMockBuilder.build(problem = problem)
            val leaderboardCell = LeaderboardMockBuilder.buildCell()
            val event = SubmissionEvent.Updated(submission.id)
            every { submissionRepository.findById(submission.id) } returns submission
            every {
                submissionRepository.findAllByMemberIdAndProblemIdAndStatus(
                    submission.member.id,
                    submission.problem.id,
                    Submission.Status.JUDGED,
                )
            } returns listOf(submission)
            every {
                leaderboardCellBuilder.build(
                    submission.contest,
                    submission.member,
                    submission.problem,
                    listOf(submission),
                )
            } returns leaderboardCell

            sut.handle(event)

            verify(exactly = 0) {
                broadcastProducer.produce(ContestantDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission))
            }
            verify(exactly = 0) {
                broadcastProducer.produce(GuestDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission))
            }
            verify(exactly = 0) {
                broadcastProducer.produce(
                    AdminDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify(exactly = 0) {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify(exactly = 0) {
                broadcastProducer.produce(
                    GuestDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify(exactly = 0) {
                broadcastProducer.produce(
                    JudgeDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify(exactly = 0) {
                broadcastProducer.produce(
                    StaffDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify(exactly = 0) { leaderboardCacheStore.cacheCell(submission.contest.id, leaderboardCell) }
        }
    })
