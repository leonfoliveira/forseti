package io.github.leonfoliveira.judge.common.service.authentication

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Session
import io.github.leonfoliveira.judge.common.domain.exception.InternalServerException
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.repository.SessionRepository
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.ContestAuthenticateInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.RootAuthenticateInputDTO
import io.github.leonfoliveira.judge.common.util.UnitUtil
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.util.UUID

@Service
class AuthenticationService(
    private val memberRepository: MemberRepository,
    private val sessionRepository: SessionRepository,
    private val hashAdapter: HashAdapter,
    @Value("\${security.jwt.expiration}")
    private val expiration: String,
    @Value("\${security.jwt.root-expiration}")
    private val rootExpiration: String,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun authenticateAutoJudge(): Session {
        logger.info("Authenticating autojudge")

        val member =
            memberRepository.findByLogin(Member.AUTOJUDGE_LOGIN)
                ?: throw InternalServerException("Could not find autojudge member")

        val session = buildSession(member)
        logger.info("Finished authenticating autojudge member with session id = ${session.id}")
        return session
    }

    fun authenticateRoot(inputDTO: RootAuthenticateInputDTO): Session {
        logger.info("Authenticating root")

        val member =
            memberRepository.findByLogin(Member.ROOT_LOGIN)
                ?: throw InternalServerException("Could not find root member")

        if (!hashAdapter.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid password")
        }

        val session = buildSession(member)
        logger.info("Finished authenticating root member with session id = ${session.id}")
        return session
    }

    fun authenticate(
        contestId: UUID,
        inputDTO: ContestAuthenticateInputDTO,
    ): Session {
        logger.info("Authenticating member for contest with id = $contestId")

        val member =
            memberRepository.findByLoginAndContestId(inputDTO.login, contestId)
                ?: memberRepository.findByLoginAndContestId(inputDTO.login, null)
                ?: throw UnauthorizedException("Invalid login or password")

        if (!hashAdapter.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        val session = buildSession(member)
        logger.info("Finished authenticating member with session id = ${session.id}")
        return session
    }

    private fun buildSession(member: Member): Session {
        val expiresAt =
            OffsetDateTime.now().plusSeconds(
                if (member.type == Member.Type.ROOT) {
                    UnitUtil.parseTimeValue(rootExpiration)
                } else {
                    UnitUtil.parseTimeValue(expiration)
                } / 1000L,
            )

        val session =
            Session(
                member = member,
                expiresAt = expiresAt,
            )
        return sessionRepository.save(session)
    }
}
