package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.contest.DeleteContestUseCase
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DeleteContestService(
    private val memberRepository: MemberRepository,
    private val contestRepository: ContestRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : DeleteContestUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional
    override fun execute() {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Deleting contest with id: {}", contextContestId)

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id = $contextMemberId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id '$contextMemberId' in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberType(Member.Type.ROOT)
            .requireContestNotStarted()
            .throwIfErrors()

        contest.deletedAt = ExecutionContext.get().startedAt
        contestRepository.save(contest)
        applicationEventPublisher.publishEvent(ContestEvent.Deleted(contest))

        logger.info("Contest deleted successfully")
    }
}
