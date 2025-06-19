package io.github.leonfoliveira.judge.core.service.clarification

import io.github.leonfoliveira.judge.core.domain.entity.Clarification
import io.github.leonfoliveira.judge.core.domain.entity.Member
import io.github.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.event.ClarificationEvent
import io.github.leonfoliveira.judge.core.repository.ClarificationRepository
import io.github.leonfoliveira.judge.core.repository.ContestRepository
import io.github.leonfoliveira.judge.core.service.dto.input.clarification.CreateClarificationInputDTO
import io.github.leonfoliveira.judge.core.util.TransactionalEventPublisher
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CreateClarificationService(
    private val contestRepository: ContestRepository,
    private val clarificationRepository: ClarificationRepository,
    private val transactionalEventPublisher: TransactionalEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun create(
        contestId: UUID,
        memberId: UUID,
        input: CreateClarificationInputDTO,
    ): Clarification {
        logger.info("Creating clarification for contest with id: $contestId")

        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id $contestId")
            }
        if (!contest.hasStarted()) {
            throw NotFoundException("Contest with id $contestId has not started yet")
        }
        val member =
            contest.members.find { it.id == memberId }
                ?: throw NotFoundException("Could not find member with id $memberId")
        val problem =
            input.problemId?.let {
                contest.problems.find { it.id == input.problemId }
                    ?: throw NotFoundException("Could not find problem with id ${input.problemId} in contest $contestId")
            }
        val parent =
            input.parentId?.let {
                clarificationRepository.findById(it).orElseThrow {
                    NotFoundException("Could not find parent announcement with id $it")
                }
            }

        if (member.type == Member.Type.CONTESTANT && input.parentId != null) {
            throw ForbiddenException("Contestants cannot create clarifications with a parent")
        }
        if (member.type == Member.Type.JURY && input.parentId == null) {
            throw ForbiddenException("Jury members cannot create clarifications without a parent")
        }

        val clarification =
            Clarification(
                contest = contest,
                member = member,
                text = input.text,
                problem = problem,
                parent = parent,
            )
        clarificationRepository.save(clarification)
        transactionalEventPublisher.publish(ClarificationEvent(this, clarification))
        logger.info("Clarification created successfully")
        return clarification
    }
}
