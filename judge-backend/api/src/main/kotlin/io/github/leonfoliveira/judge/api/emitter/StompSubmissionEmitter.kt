package io.github.leonfoliveira.judge.api.emitter

import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toPublicResponseDTO
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.service.contest.FindContestService
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompSubmissionEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
    private val contestFindContestService: FindContestService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun emit(submission: Submission) {
        logger.info(
            "Emitting submission with id: ${submission.id} " +
                "for contest: ${submission.contest.id} and member: ${submission.member.id}",
        )

        val contest = submission.contest

        messagingTemplate.convertAndSend(
            "/topic/contests/${contest.id}/submissions",
            submission.toPublicResponseDTO(),
        )
        messagingTemplate.convertAndSend(
            "/topic/contests/${contest.id}/submissions/full",
            submission.toFullResponseDTO(),
        )
        messagingTemplate.convertAndSend(
            "/topic/members/${submission.member.id}/submissions",
            submission.toPublicResponseDTO(),
        )

        val leaderboard = contestFindContestService.buildContestLeaderboard(contest)
        messagingTemplate.convertAndSend(
            "/topic/contests/${submission.contest.id}/leaderboard",
            leaderboard,
        )
    }
}
