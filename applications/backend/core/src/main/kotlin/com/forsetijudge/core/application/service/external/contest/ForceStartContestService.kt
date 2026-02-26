package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.contest.ForceStartContestUseCase
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ForceStartContestService(
    val contestRepository: ContestRepository,
    val memberRepository: MemberRepository,
    val applicationEventPublisher: ApplicationEventPublisher,
) : ForceStartContestUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(): Contest {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Force starting contest with id: $contextContestId")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id: $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .requireContestNotStarted()
            .throwIfErrors()

        if (contest.hasStarted()) {
            throw ForbiddenException("Cannot force start a contest that has already started")
        }

        contest.startAt = ExecutionContext.get().startedAt
        contestRepository.save(contest)
        applicationEventPublisher.publishEvent(ContestEvent.Updated(contest))

        logger.info("Contest force started successfully")
        return contest
    }
}
