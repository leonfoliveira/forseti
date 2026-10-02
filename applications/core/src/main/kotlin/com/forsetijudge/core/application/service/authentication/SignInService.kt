package com.forsetijudge.core.application.service.authentication

import com.forsetijudge.core.application.helper.session.SessionCreator
import com.forsetijudge.core.application.helper.session.SessionDeleter
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.Session
import com.forsetijudge.core.port.input.usecase.authentication.SignInUseCase
import com.forsetijudge.core.port.output.cryptography.Hasher
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.vault.Vault
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SignInService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val sessionCreator: SessionCreator,
    private val sessionDeleter: SessionDeleter,
    private val vault: Vault,
    private val hasher: Hasher,
) : SignInUseCase {
    private val logger = SafeLogger(this::class)

    companion object {
        const val ROOT_PASSWORD_SECRET_KEY = "root_password"
    }

    /**
     * Authenticates a user and creates a new session.
     *
     * @param command The command containing the login credentials.
     * @return The created session if authentication is successful.
     */
    @Transactional
    override fun execute(command: SignInUseCase.Command): Session {
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

        if (member.type == Member.Type.ROOT) {
            val expectedPassword = vault.getSecret(ROOT_PASSWORD_SECRET_KEY)
            if (command.password != expectedPassword) {
                throw UnauthorizedException("Invalid login or password")
            }
        } else {
            if (!hasher.verify(command.password, member.password)) {
                throw UnauthorizedException("Invalid login or password")
            }
        }

        sessionDeleter.deleteByMember(member)
        val session = sessionCreator.create(command.contestId, member)

        logger.info("Finished authenticating member with session id = ${session.id}")
        return session
    }
}
