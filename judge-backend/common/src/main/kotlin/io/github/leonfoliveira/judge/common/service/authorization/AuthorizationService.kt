package io.github.leonfoliveira.judge.common.service.authorization

import io.github.leonfoliveira.judge.common.domain.exception.InternalServerException
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.port.JwtAdapter
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.AuthenticateInputDTO
import java.util.UUID
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class AuthorizationService(
    private val memberRepository: MemberRepository,
    private val hashAdapter: HashAdapter,
    private val jwtAdapter: JwtAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun authenticateAutoJudge(): Authorization {
        logger.info("Authenticating autojudge")

        val member =
            memberRepository.findByLogin("autojudge")
                ?: throw InternalServerException("Could not find autojudge member")

        logger.info("Finished authenticating autojudge member")
        return jwtAdapter.buildAuthorization(member)
    }

    fun authenticate(inputDTO: AuthenticateInputDTO): Authorization {
        logger.info("Authenticating member for contest with id = ${inputDTO.contestId}")

        val member =
            memberRepository.findByLoginAndContestId(inputDTO.login, inputDTO.contestId)
                ?: memberRepository.findByLoginAndContestId(inputDTO.login, null)
                ?: throw UnauthorizedException("Invalid login or password")

        if (!hashAdapter.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        logger.info("Finished authenticating member with id = ${member.id}")
        return jwtAdapter.buildAuthorization(member)
    }

    fun encodeToken(authorization: Authorization): String {
        logger.info("Encoding token for member with id = ${authorization.member.id}")
        return jwtAdapter.encodeToken(authorization)
    }
}
