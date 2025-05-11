package io.leonfoliveira.judge.core.service.authorization

import io.leonfoliveira.judge.core.entity.model.Authorization
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.exception.UnauthorizedException
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.port.JwtAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class AuthorizationService(
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val jwtAdapter: JwtAdapter,
) {
    @Value("\${security.root.password}")
    lateinit var rootPassword: String

    data class AuthorizationOutput(
        val authorization: Authorization,
        val token: String,
    )

    fun authenticateRoot(password: String): AuthorizationOutput {
        if (password != rootPassword) {
            throw UnauthorizedException("Invalid root password")
        }

        val authorization = Authorization.ROOT
        val token = jwtAdapter.generateToken(authorization)
        return AuthorizationOutput(authorization, token)
    }

    fun authenticateMember(
        contestId: Int,
        login: String,
        password: String,
    ): AuthorizationOutput {
        val contest =
            contestRepository.findById(contestId).orElseThrow {
                throw NotFoundException("Could not find contest with id = $contestId")
            }
        val member =
            contest.members.find { it.login == login }
                ?: throw UnauthorizedException("Invalid login or password")

        if (!hashAdapter.verify(password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        val authorization =
            Authorization(
                id = member.id,
                name = member.name,
                login = member.login,
                type = member.type,
            )
        val token = jwtAdapter.generateToken(authorization)
        return AuthorizationOutput(authorization, token)
    }
}
