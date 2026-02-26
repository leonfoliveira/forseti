package com.forsetijudge.core.application.service.external.authentication

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.authentication.ContestAuthorizerUseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ContestAuthorizerService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
) : ContestAuthorizerUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional(readOnly = true)
    override fun execute(command: ContestAuthorizerUseCase.Command) {
        val contextContestId = ExecutionContext.getContestIdNullable()
        val contextMemberId = ExecutionContext.getMemberIdNullable()

        logger.info("Authorizing member with id: $contextMemberId for contest with id: $contextContestId")

        val contest =
            contextContestId?.let {
                contestRepository.findById(contextContestId)
                    ?: throw NotFoundException("Contest with id $contextContestId not found")
            }
        val member =
            contextMemberId?.let {
                contextContestId?.let {
                    memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                        ?: throw NotFoundException("Member with id $contextMemberId not found in this contest")
                } ?: memberRepository.findById(contextMemberId)
                    ?: throw NotFoundException("Member with id $contextMemberId not found")
            }

        command.chain(ContestAuthorizer(contest, member))

        logger.info("Authorization successful")
    }
}
