package com.forsetijudge.core.application.service.external.authentication

import com.forsetijudge.core.application.service.internal.session.SessionCreator
import com.forsetijudge.core.application.service.internal.session.SessionDeleter
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.cryptography.Hasher
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.authentication.SignInUseCase
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SignInService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val sessionCreator: SessionCreator,
    private val sessionDeleter: SessionDeleter,
    private val hasher: Hasher,
) : SignInUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(command: SignInUseCase.Command): SessionResponseBodyDTO {
        val contextContestId = ExecutionContext.getContestIdNullable()

        logger.info("Authenticating to contest with id = $contextContestId")

        val contest =
            contextContestId?.let {
                contestRepository.findById(contextContestId)
                    ?: throw NotFoundException("Invalid login or password")
            }

        val member =
            if (contest == null) {
                memberRepository.findByLoginAndContestIsNull(command.login)
            } else {
                memberRepository.findByLoginAndContestIdOrContestIsNull(command.login, contextContestId)
            } ?: throw UnauthorizedException("Invalid login or password")

        if (!hasher.verify(command.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        sessionDeleter.deleteAllByMember(member)
        val session = sessionCreator.create(member)

        logger.info("Finished authenticating member with session id = ${session.id}")
        return session.toResponseBodyDTO()
    }
}
