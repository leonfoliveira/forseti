package com.forsetijudge.core.application.service.external.clarification

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ClarificationRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.clarification.DeleteClarificationUseCase
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DeleteClarificationService(
    private val clarificationRepository: ClarificationRepository,
    private val memberRepository: MemberRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : DeleteClarificationUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional
    override fun execute(command: DeleteClarificationUseCase.Command) {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Deleting clarification with id: {}", command.clarificationId)

        val clarification =
            clarificationRepository.findByIdAndContestId(command.clarificationId, contextContestId)
                ?: throw NotFoundException("Could not find clarification with id ${command.clarificationId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id $contextMemberId")

        ContestAuthorizer(clarification.contest, member)
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)
            .throwIfErrors()

        clarification.deletedAt = ExecutionContext.get().startedAt

        clarificationRepository.save(clarification)
        applicationEventPublisher.publishEvent(ClarificationEvent.Deleted(clarification))

        logger.info("Clarification deleted successfully")
    }
}
