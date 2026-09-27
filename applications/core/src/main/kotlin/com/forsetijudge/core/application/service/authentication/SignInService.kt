package com.forsetijudge.core.application.service.authentication

import com.forsetijudge.core.application.helper.session.SessionCreator
import com.forsetijudge.core.application.helper.session.SessionDeleter
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.authentication.SignInUseCase
import com.forsetijudge.core.port.output.cryptography.Hasher
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
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

    /**
     * Authenticates a user and creates a new session.
     *
     * @param command The command containing the login credentials.
     * @return The created session if authentication is successful.
     */
    @Transactional
    override fun execute(command: SignInUseCase.Command): SessionResponseBodyDTO {
        logger.info("Authenticating to contest with id = ${command.contestId} and login = ${command.login}")

        val contest =
            command.contestId?.let {
                contestRepository.findById(command.contestId)
                    ?: throw NotFoundException("Invalid login or password")
            }

        val member =
            if (contest == null) {
                memberRepository.findByLoginAndContestIsNull(command.login)
            } else {
                memberRepository.findByLoginAndContestIdOrContestIsNull(command.login, command.contestId)
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
