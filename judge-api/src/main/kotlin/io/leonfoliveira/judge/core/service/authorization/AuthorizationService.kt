package io.leonfoliveira.judge.core.service.authorization

import io.leonfoliveira.judge.core.entity.model.Authorization
import io.leonfoliveira.judge.core.exception.UnauthorizedException
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.port.JwtAdapter
import io.leonfoliveira.judge.core.repository.MemberRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class AuthorizationService(
    private val memberRepository: MemberRepository,
    private val hashAdapter: HashAdapter,
    private val jwtAdapter: JwtAdapter,
) {
    @Value("\${security.root.password}")
    lateinit var rootPassword: String

    fun authenticateRoot(password: String): Authorization {
        if (password != rootPassword) {
            throw UnauthorizedException("Invalid root password")
        }

        val claims = Authorization.Claims.ROOT
        val token = jwtAdapter.generateToken(claims)
        return Authorization(claims, token)
    }

    fun authenticateMember(login: String, password: String): Authorization {
        val member = memberRepository.findByLogin(login)
            ?: throw UnauthorizedException("Invalid login or password")

        if (!hashAdapter.verify(password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        val claims = Authorization.Claims(
            id = member.id,
            name = member.name,
            login = member.login,
        )
        val token = jwtAdapter.generateToken(claims)
        return Authorization(claims, token)
    }
}