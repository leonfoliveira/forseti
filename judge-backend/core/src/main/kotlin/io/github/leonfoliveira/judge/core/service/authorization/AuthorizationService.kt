package io.github.leonfoliveira.judge.core.service.authorization

import io.github.leonfoliveira.judge.core.domain.entity.Member
import io.github.leonfoliveira.judge.core.domain.exception.InternalServerException
import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.core.domain.model.Authorization
import io.github.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.core.port.HashAdapter
import io.github.leonfoliveira.judge.core.port.JwtAdapter
import io.github.leonfoliveira.judge.core.repository.ContestRepository
import io.github.leonfoliveira.judge.core.repository.MemberRepository
import io.github.leonfoliveira.judge.core.service.dto.input.authorization.AuthenticateInputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AuthorizationService(
    private val memberRepository: MemberRepository,
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val jwtAdapter: JwtAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun authenticate(inputDTO: AuthenticateInputDTO): Authorization {
        logger.info("Authenticating member")

        val member =
            memberRepository.findByLogin(inputDTO.login)
                ?: throw UnauthorizedException("Invalid login or password")
        return authenticate(inputDTO.password, member)
    }

    fun authenticateAutoJury(): Authorization {
        logger.info("Authenticating auto-jury")

        val member = memberRepository.findByLogin("auto-jury")
            ?: throw InternalServerException("Could not find auto-jury member")

        val authorization =
            AuthorizationMember(
                id = member.id,
                name = member.name,
                login = member.login,
                type = member.type,
            )
        val token = jwtAdapter.generateToken(authorization)

        logger.info("Finished authenticating auto-jury member")
        return Authorization(authorization, token)
    }

    fun authenticateForContest(
        contestId: UUID,
        inputDTO: AuthenticateInputDTO,
    ): Authorization {
        logger.info("Authenticating member for contest with id = $contestId")

        val contest =
            contestRepository.findById(contestId).orElseThrow {
                throw NotFoundException("Could not find contest with id = $contestId")
            }
        if (!contest.isActive()) {
            throw UnauthorizedException("Contest is not active")
        }
        val member =
            contest.members.find { it.login == inputDTO.login }
                ?: throw UnauthorizedException("Invalid login or password")

        return authenticate(inputDTO.password, member)
    }

    private fun authenticate(
        password: String,
        member: Member,
    ): Authorization {
        if (!hashAdapter.verify(password, member.password)) {
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
