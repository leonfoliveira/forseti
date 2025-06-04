package io.leonfoliveira.judge.core.service.authorization

import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import io.leonfoliveira.judge.core.domain.model.Authorization
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.port.JwtAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.AuthenticateMemberInputDTO
import io.leonfoliveira.judge.core.service.dto.input.AuthenticateRootInputDTO
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class AuthorizationService(
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val jwtAdapter: JwtAdapter,
    @Value("\${security.root.password}")
    private val rootPassword: String,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun authenticateRoot(inputDTO: AuthenticateRootInputDTO): Authorization {
        logger.info("Authenticating root user")

        if (inputDTO.password != rootPassword) {
            throw UnauthorizedException("Invalid root password")
        }

        val authorization = AuthorizationMember.ROOT
        val token = jwtAdapter.generateToken(authorization)

        logger.info("Finished authenticating root user")
        return Authorization(authorization, token)
    }

    fun authenticateMember(
        contestId: Int,
        inputDTO: AuthenticateMemberInputDTO,
    ): Authorization {
        logger.info("Authenticating member for contest with id = $contestId")

        val contest =
            contestRepository.findById(contestId).orElseThrow {
                throw NotFoundException("Could not find contest with id = $contestId")
            }
        val member =
            contest.members.find { it.login == inputDTO.login }
                ?: throw UnauthorizedException("Invalid login or password")

        if (!hashAdapter.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        val authorization =
            AuthorizationMember(
                id = member.id,
                name = member.name,
                login = member.login,
                type = member.type,
            )
        val token = jwtAdapter.generateToken(authorization)

        logger.info("Finished authenticating member")
        return Authorization(authorization, token)
    }
}
