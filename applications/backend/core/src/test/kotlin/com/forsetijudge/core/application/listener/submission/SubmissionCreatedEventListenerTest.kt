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
import com.forsetijudge.core.port.driven.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.queue.payload.SubmissionQueuePayload
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardCellUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [SubmissionCreatedEventListener::class])
class SubmissionCreatedEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val buildLeaderboardCellUseCase: BuildLeaderboardCellUseCase,
    @MockkBean(relaxed = true)
    private val broadcastProducer: BroadcastProducer,
    @MockkBean(relaxed = true)
    private val submissionQueueProducer: SubmissionQueueProducer,
    private val sut: SubmissionCreatedEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val submission = SubmissionMockBuilder.build()
            val leaderboardCell = LeaderboardMockBuilder.buildCell()
            val event = SubmissionEvent.Created(submission)
            every {
                buildLeaderboardCellUseCase.execute(
                    BuildLeaderboardCellUseCase.Command(
                        memberId = submission.member.id,
                        problemId = submission.problem.id,
                    ),
                )
            } returns Pair(leaderboardCell, submission.member.id)

            sut.onApplicationEvent(event)

            verify { broadcastProducer.produce(AdminDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }
            verify {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission),
                )
            }
            verify { broadcastProducer.produce(GuestDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }
            verify { broadcastProducer.produce(JudgeDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }
            verify { broadcastProducer.produce(StaffDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }

            verify {
                submissionQueueProducer.produce(
                    SubmissionQueuePayload(submissionId = submission.id),
                )
            }
        }

        test("should not produce to submission queue if auto judge is disabled") {
            val contest = ContestMockBuilder.build()
            contest.settings.isAutoJudgeEnabled = false
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
            val event = SubmissionEvent.Created(submission)

            sut.onApplicationEvent(event)

            verify(exactly = 0) {
                submissionQueueProducer.produce(
                    SubmissionQueuePayload(submissionId = submission.id),
                )
            }
        }
    })
