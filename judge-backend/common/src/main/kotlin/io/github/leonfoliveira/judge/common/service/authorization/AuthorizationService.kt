package io.github.leonfoliveira.judge.common.service.authorization

import io.github.leonfoliveira.judge.common.domain.exception.InternalServerException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.port.JwtAdapter
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.AuthenticateInputDTO
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
        if (member.isSystem) {
            throw UnauthorizedException("Invalid login or password")
        }
        if (!hashAdapter.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        logger.info("Finished authenticating member")
        return jwtAdapter.buildAuthorization(member)
    }

    fun authenticateAutoJudge(): Authorization {
        logger.info("Authenticating autojudge")

        val member =
            memberRepository.findByLogin("autojudge")
                ?: throw InternalServerException("Could not find autojudge member")

        logger.info("Finished authenticating autojudge member")
        return jwtAdapter.buildAuthorization(member)
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
        return jwtAdapter.buildAuthorization(member)
    }

    fun encodeToken(authorization: Authorization): String {
        logger.info("Encoding token for member with id = ${authorization.member.id}")
        return jwtAdapter.encodeToken(authorization)
    }
}
