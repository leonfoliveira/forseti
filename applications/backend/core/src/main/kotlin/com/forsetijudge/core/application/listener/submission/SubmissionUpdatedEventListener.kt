package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardCellUseCase
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseBodyDTO
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionUpdatedEventListener(
    private val buildLeaderboardCellUseCase: BuildLeaderboardCellUseCase,
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<Submission, SubmissionEvent.Updated>() {
    @TransactionalEventListener(SubmissionEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: SubmissionEvent.Updated) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Submission) {
        val submission = payload
        val (leaderboardCell) =
            buildLeaderboardCellUseCase.execute(
                BuildLeaderboardCellUseCase.Command(memberId = submission.member.id, problemId = submission.problem.id),
            )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardAdmin(submission.contest.id),
                event = BroadcastEvent.SUBMISSION_UPDATED,
                body = submission.toWithCodeAndExecutionResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardJudge(submission.contest.id),
                event = BroadcastEvent.SUBMISSION_UPDATED,
                body = submission.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsMembers(submission.contest.id, submission.member.id),
                event = BroadcastEvent.SUBMISSION_UPDATED,
                body = submission.toWithCodeResponseBodyDTO(),
            ),
        )

        if (!submission.contest.isFrozen) {
            broadcastProducer.produce(
                BroadcastPayload(
                    topic = BroadcastTopic.ContestsDashboardContestant(submission.contest.id),
                    event = BroadcastEvent.SUBMISSION_UPDATED,
                    body = submission.toResponseBodyDTO(),
                ),
            )

            broadcastProducer.produce(
                BroadcastPayload(
                    topic = BroadcastTopic.ContestsDashboardGuest(submission.contest.id),
                    event = BroadcastEvent.SUBMISSION_UPDATED,
                    body = submission.toResponseBodyDTO(),
                ),
            )

            broadcastProducer.produce(
                BroadcastPayload(
                    topic = BroadcastTopic.ContestsDashboardStaff(submission.contest.id),
                    event = BroadcastEvent.SUBMISSION_UPDATED,
                    body = submission.toResponseBodyDTO(),
                ),
            )

            broadcastProducer.produce(
                BroadcastPayload(
                    topic = BroadcastTopic.ContestsMembers(submission.contest.id, submission.member.id),
                    event = BroadcastEvent.SUBMISSION_UPDATED,
                    body = submission.toWithCodeResponseBodyDTO(),
                ),
            )

            broadcastProducer.produce(
                BroadcastPayload(
                    topic = BroadcastTopic.ContestsDashboardAdmin(submission.contest.id),
                    event = BroadcastEvent.LEADERBOARD_UPDATED,
                    body = leaderboardCell.toResponseBodyDTO(submission.member.id),
                ),
            )

            broadcastProducer.produce(
                BroadcastPayload(
                    topic = BroadcastTopic.ContestsDashboardContestant(submission.contest.id),
                    event = BroadcastEvent.LEADERBOARD_UPDATED,
                    body = leaderboardCell.toResponseBodyDTO(submission.member.id),
                ),
            )

            broadcastProducer.produce(
                BroadcastPayload(
                    topic = BroadcastTopic.ContestsDashboardGuest(submission.contest.id),
                    event = BroadcastEvent.LEADERBOARD_UPDATED,
                    body = leaderboardCell.toResponseBodyDTO(submission.member.id),
                ),
            )

            broadcastProducer.produce(
                BroadcastPayload(
                    topic = BroadcastTopic.ContestsDashboardJudge(submission.contest.id),
                    event = BroadcastEvent.LEADERBOARD_UPDATED,
                    body = leaderboardCell.toResponseBodyDTO(submission.member.id),
                ),
            )

            broadcastProducer.produce(
                BroadcastPayload(
                    topic = BroadcastTopic.ContestsDashboardStaff(submission.contest.id),
                    event = BroadcastEvent.LEADERBOARD_UPDATED,
                    body = leaderboardCell.toResponseBodyDTO(submission.member.id),
                ),
            )
        }
    }
}
