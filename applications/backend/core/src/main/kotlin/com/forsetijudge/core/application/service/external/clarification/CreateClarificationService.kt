package com.forsetijudge.core.application.service.external.clarification

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ClarificationRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driving.usecase.external.clarification.CreateClarificationUseCase
import jakarta.validation.Valid
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateClarificationService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
    private val clarificationRepository: ClarificationRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : CreateClarificationUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(
        @Valid command: CreateClarificationUseCase.Command,
    ): Clarification {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Creating clarification")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireSettingClarificationEnabled()
            .throwIfErrors()

        val isAnswer = command.parentId != null
        if (isAnswer) {
            if (command.problemId != null) {
                throw ForbiddenException("Problem ID must be null when creating an answer clarification")
            }

            ContestAuthorizer(contest, member)
                .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)
                .throwIfErrors()
        } else {
            ContestAuthorizer(contest, member)
                .requireMemberType(Member.Type.CONTESTANT, Member.Type.UNOFFICIAL_CONTESTANT)
                .requireContestStarted()
                .throwIfErrors()
        }

        val problem =
            command.problemId?.let {
                problemRepository.findByIdAndContestId(command.problemId, contest.id)
                    ?: throw NotFoundException("Could not find problem with id ${command.problemId} in this contest")
            }
        val parent =
            command.parentId?.let {
                clarificationRepository.findByIdAndContestId(it, contest.id)
                    ?: throw NotFoundException("Could not find parent clarification with id $it in contest")
            }

        val clarification =
            Clarification(
                contest = contest,
                member = member,
                text = command.text,
                problem = problem,
                parent = parent,
            )
        clarificationRepository.save(clarification)
        applicationEventPublisher.publishEvent(ClarificationEvent.Created(clarification))

        logger.info("Clarification created successfully with id = ${clarification.id}")
        return clarification
    }
}
