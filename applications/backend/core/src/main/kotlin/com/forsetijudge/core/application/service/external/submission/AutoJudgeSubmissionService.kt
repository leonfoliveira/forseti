package com.forsetijudge.core.application.service.external.submission

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.CoreMetrics
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.SubmissionRunner
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.submission.AutoJudgeSubmissionUseCase
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AutoJudgeSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val memberRepository: MemberRepository,
    private val submissionRunner: SubmissionRunner,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : AutoJudgeSubmissionUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional
    override fun execute(command: AutoJudgeSubmissionUseCase.Command) {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Auto judging submission with id: ${command.submissionId}")

        val preJudgeSubmission =
            submissionRepository.findByIdAndContestId(command.submissionId, contextContestId)
                ?: throw NotFoundException("Could not find submission with id = ${command.submissionId} in this contest")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")

        ContestAuthorizer(preJudgeSubmission.contest, member)
            .requireMemberType(Member.Type.AUTOJUDGE)
            .throwIfErrors()

        /**
         * Judges can manually judge the submission before the auto judging process. This service cannot override the judges' decision.
         * Concurrency issues are acceptable as the judge can manually judge the submission again after the auto judging process if needed.
         */
        if (preJudgeSubmission.status != Submission.Status.JUDGING) {
            logger.info("Submission is not in JUDGING status. Current status: ${preJudgeSubmission.status}. Skipping judging process.")
            return
        }

        CoreMetrics.RECEIVED_SUBMISSION.inc()

        val answer =
            try {
                val execution =
                    CoreMetrics.SUBMISSION_RUN_TIME_SECONDS.run {
                        submissionRunner.run(preJudgeSubmission)
                    }

                CoreMetrics.SUCCESSFUL_SUBMISSION
                    .labelValues(execution.answer.toString())
                    .inc()
                logger.info("Execution completed with answer: ${execution.answer}. Updating submission answer.")
                execution.answer
            } catch (ex: Exception) {
                CoreMetrics.FAILED_SUBMISSION.inc()
                throw ex
            }

        val postJudgeSubmission =
            submissionRepository.findByIdAndContestId(command.submissionId, contextContestId)
                ?: throw NotFoundException(
                    "Could not find submission with id = ${command.submissionId} in this contest after judging process",
                )

        /**
         * Judges can manually judge the submission during the auto judging process. This service cannot override the judges' decision.
         * Concurrency issues are acceptable as the judge can manually judge the submission again after the auto judging process if needed.
         */
        if (postJudgeSubmission.status != Submission.Status.JUDGING) {
            logger.info(
                "Submission status changed during judging process. " +
                    "Current status: ${postJudgeSubmission.status}. Skipping updating submission answer.",
            )
            return
        }

        postJudgeSubmission.answer = answer
        postJudgeSubmission.status = Submission.Status.JUDGED
        submissionRepository.save(postJudgeSubmission)
        applicationEventPublisher.publishEvent(SubmissionEvent.Updated(postJudgeSubmission))

        logger.info("Submission judged")
    }
}
