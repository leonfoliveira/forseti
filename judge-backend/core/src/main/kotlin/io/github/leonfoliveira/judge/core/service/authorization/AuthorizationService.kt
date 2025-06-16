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
        logger.info("Authenticating member with login = ${inputDTO.login}")

        val member =
            memberRepository.findByLogin(inputDTO.login)
                ?: throw UnauthorizedException("Invalid login or password")
        if (!hashAdapter.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        logger.info("Finished authenticating member")
        return buildAuthorization(member)
    }

    fun authenticateAutoJury(): Authorization {
        logger.info("Authenticating auto-jury")

        val member =
            memberRepository.findByLogin("auto-jury")
                ?: throw InternalServerException("Could not find auto-jury member")

        logger.info("Finished authenticating auto-jury member")
        return buildAuthorization(member)
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
        if (!hashAdapter.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        logger.info("Finished authenticating member for contest")
        return buildAuthorization(member)
    }

    private fun buildAuthorization(member: Member): Authorization {
        val authorization =
            AuthorizationMember(
                id = member.id,
                contestId = member.contest?.id,
                name = member.name,
                type = member.type,
            )
        val token = jwtAdapter.generateToken(authorization)

        return Authorization(authorization, token)
    }
}
