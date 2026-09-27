package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.FindAllContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.ExecutionContext
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindAllContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
) : FindAllContestUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Finds all contests available in the system.
     *
     * @return A list of contests available in the system.
     */
    @Transactional(readOnly = true)
    override fun execute(): List<ContestResponseBodyDTO> {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Finding all contests")

        val member =
            memberRepository.findById(contextMemberId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId")

        if (member.type != Member.Type.ROOT) {
            throw ForbiddenException("Member with id: $contextMemberId is not authorized to find all contests")
        }

        val contests = contestRepository.findAllOrdersByCreatedAt()

        logger.info("Found ${contests.size} contests")
        return contests.map { it.toResponseBodyDTO() }
    }
}
