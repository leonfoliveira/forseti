package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.freeze
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.contest.AutoFreezeContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import java.time.OffsetDateTime
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AutoFreezeContestService(
    private val contestRepository: ContestRepository,
    private val submissionRepository: SubmissionRepository,
    private val frozenSubmissionRepository: FrozenSubmissionRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : AutoFreezeContestUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Auto Freezes the contest with the given ID, preventing further modifications or submissions.
     *
     * @param command The command containing the contest ID to be frozen.
     */
    @Transactional
    override fun execute(command: AutoFreezeContestUseCase.Command) {
        logger.info("Auto freezing contest with id: ${command.contestId}")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id ${command.contestId}")

        if (contest.isFrozen()) {
            logger.info("Contest with id: ${command.contestId} is already frozen. Skipping auto freeze.")
            return
        }

        val frozenSubmissions =
            submissionRepository
                .findAllByContestId(contest.id)
                .map { submission -> submission.freeze() }
        frozenSubmissionRepository.saveAll(frozenSubmissions)

        contest.frozenAt = OffsetDateTime.now()
        contestRepository.save(contest)
        businessEventPublisher.publish(ContestEvent.Frozen(contestId = contest.id))

        logger.info("Auto frozen contest with id: ${command.contestId}")
    }
}
