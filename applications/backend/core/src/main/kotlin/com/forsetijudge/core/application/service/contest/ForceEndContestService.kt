package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.application.helper.outbox.OutboxEventPublisher
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.contest.ForceEndContestUseCase
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ForceEndContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val outboxEventPublisher: OutboxEventPublisher,
) : ForceEndContestUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(): ContestWithMembersAndProblemsResponseBodyDTO {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Force ending contest with id: $contextContestId")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id: $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id: $contextContestId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .requireContestActive()
            .throwIfErrors()

        contest.endAt = ExecutionContext.get().startedAt
        contestRepository.save(contest)
        outboxEventPublisher.publish(ContestEvent.Updated(contest.id))

        logger.info("Contest force ended successfully")
        return contest.toWithMembersAndProblemsResponseBodyDTO()
    }
}
