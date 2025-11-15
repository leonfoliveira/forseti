package io.github.leonfoliveira.forseti.common.application.service.clarification

import io.github.leonfoliveira.forseti.common.application.domain.entity.Clarification
import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.event.ClarificationCreatedEvent
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.dto.input.clarification.CreateClarificationInputDTO
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ClarificationRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.application.port.driving.CreateClarificationUseCase
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CreateClarificationService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val clarificationRepository: ClarificationRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : CreateClarificationUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates a clarification for a contest.
     *
     * @param contestId The ID of the contest.
     * @param memberId The ID of the member creating the clarification.
     * @param input The input data for creating the clarification.
     * @return The created clarification.
     * @throws NotFoundException if the contest, member, problem, or parent clarification is not found.
     * @throws ForbiddenException if the member is not allowed to create the clarification.
     */
    @Transactional
    override fun create(
        contestId: UUID,
        memberId: UUID,
        input: CreateClarificationInputDTO,
    ): Clarification {
        logger.info("Creating clarification for contest with id: $contestId")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id $contestId")
        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id $memberId")

        // Business rule: Contestants cannot create clarifications with a parent
        if (member.type == Member.Type.CONTESTANT && input.parentId != null) {
            throw ForbiddenException("Contestants cannot create clarifications with a parent")
        }
        // Business rule: Judges and Admins cannot create clarifications without a parent
        if (setOf(Member.Type.JUDGE, Member.Type.ADMIN).contains(member.type) && input.parentId == null) {
            throw ForbiddenException("${member.type} members cannot create clarifications without a parent")
        }

        val problem =
            input.problemId?.let {
                contest.problems.find { it.id == input.problemId }
                    ?: throw NotFoundException("Could not find problem with id ${input.problemId} in contest $contestId")
            }
        val parent =
            input.parentId?.let {
                clarificationRepository.findEntityById(it)
                    ?: throw NotFoundException("Could not find parent announcement with id $it")
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
        applicationEventPublisher.publishEvent(ClarificationCreatedEvent(this, clarification))

        logger.info("Clarification created successfully")
        return clarification
    }
}
