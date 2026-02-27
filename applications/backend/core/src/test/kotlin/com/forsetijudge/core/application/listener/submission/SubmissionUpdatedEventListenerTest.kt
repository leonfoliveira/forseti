package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
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
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardCellUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.time.OffsetDateTime

@ActiveProfiles("test")
@SpringBootTest(classes = [SubmissionUpdatedEventListener::class])
class SubmissionUpdatedEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val buildLeaderboardCellUseCase: BuildLeaderboardCellUseCase,
    @MockkBean(relaxed = true)
    private val broadcastProducer: BroadcastProducer,
    private val sut: SubmissionUpdatedEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val submission = SubmissionMockBuilder.build()
            val leaderboardCell = LeaderboardMockBuilder.buildCell()
            val event = SubmissionEvent.Updated(submission)
            every {
                buildLeaderboardCellUseCase.execute(
                    BuildLeaderboardCellUseCase.Command(
                        memberId = submission.member.id,
                        problemId = submission.problem.id,
                    ),
                )
            } returns Pair(leaderboardCell, submission.member.id)

            sut.onApplicationEvent(event)

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
                    ContestantDashboardBroadcastRoom(
                        submission.contest.id,
                    ).buildLeaderboardUpdatedEvent(leaderboardCell),
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
        }

        test("should not produce to submission topic and leaderboard cell topic if contest is frozen") {
            val contest =
                ContestMockBuilder.build(
                    frozenAt = OffsetDateTime.now().minusHours(1),
                )
            val problem = ProblemMockBuilder.build(contest = contest)
            val submission = SubmissionMockBuilder.build(problem = problem)
            val leaderboardCell = LeaderboardMockBuilder.buildCell()
            every {
                buildLeaderboardCellUseCase.execute(
                    BuildLeaderboardCellUseCase.Command(
                        memberId = submission.member.id,
                        problemId = submission.problem.id,
                    ),
                )
            } returns Pair(leaderboardCell, submission.member.id)
            val event = SubmissionEvent.Updated(submission)

            sut.onApplicationEvent(event)

            verify(
                exactly = 0,
            ) { broadcastProducer.produce(ContestantDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission)) }
            verify(
                exactly = 0,
            ) { broadcastProducer.produce(GuestDashboardBroadcastRoom(submission.contest.id).buildSubmissionUpdatedEvent(submission)) }
            verify(exactly = 0) {
                broadcastProducer.produce(
                    AdminDashboardBroadcastRoom(submission.contest.id).buildLeaderboardUpdatedEvent(leaderboardCell),
                )
            }
            verify(exactly = 0) {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(
                        submission.contest.id,
                    ).buildLeaderboardUpdatedEvent(leaderboardCell),
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
        }
    })
