package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ClarificationCreatedEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ClarificationRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driving.usecase.clarification.CreateClarificationUseCase
import com.forsetijudge.core.port.dto.input.clarification.CreateClarificationInputDTO
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CreateClarificationService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
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

        val isAnswer = input.parentId != null
        if (isAnswer) {
            ContestAuthorizer(contest, member)
                .checkMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)
        } else {
            ContestAuthorizer(contest, member)
                .checkMemberType(Member.Type.CONTESTANT)
                .checkContestStarted()
        }

        val problem =
            input.problemId?.let {
                problemRepository.findByIdAndContestId(input.problemId, contestId)
                    ?: throw NotFoundException("Could not find problem with id ${input.problemId} in contest")
            }
        val parent =
            input.parentId?.let {
                clarificationRepository.findByIdAndContestId(it, contestId)
                    ?: throw NotFoundException("Could not find parent clarification with id $it in contest")
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
