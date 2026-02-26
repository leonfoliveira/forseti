package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.contest.FindAllContestUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindAllContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
) : FindAllContestUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional(readOnly = true)
    override fun execute(): List<Contest> {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Finding all contests")

        val member =
            memberRepository.findById(contextMemberId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId")

        ContestAuthorizer(null, member)
            .requireMemberType(Member.Type.ROOT)
            .throwIfErrors()

        val contests = contestRepository.findAllOrdersByCreatedAt()

        logger.info("Found ${contests.size} contests")
        return contests
    }
}
