package io.github.leonfoliveira.judge.common.service.authentication

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Session
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.repository.SessionRepository
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.AuthenticateInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.ContestAuthenticateInputDTO
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
    @Value("\${security.session.expiration}")
    private val expiration: String,
    @Value("\${security.session.root-expiration}")
    private val rootExpiration: String,
    @Value("\${security.session.autojudge-expiration}")
    private val autoJudgeExpiration: String,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun authenticate(inputDTO: AuthenticateInputDTO): Session {
        logger.info("Authenticating")

        val member =
            memberRepository.findByLoginAndContestId(inputDTO.login, null)
                ?: throw UnauthorizedException("Invalid login or password")

        if (!hashAdapter.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        val session = createSession(member)
        logger.info("Finished authenticating member with session id = ${session.id}")
        return session
    }

    fun authenticateToContest(
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

        val session = createSession(member)
        logger.info("Finished authenticating member for contest with session id = ${session.id}")
        return session
    }

    fun createSession(member: Member): Session {
        val expiration =
            when (member.type) {
                Member.Type.ROOT -> rootExpiration
                Member.Type.AUTOJUDGE -> autoJudgeExpiration
                else -> expiration
            }
        val expiresAt = OffsetDateTime.now().plusSeconds(UnitUtil.parseTimeValue(expiration) / 1000L)

        val session =
            Session(
                member = member,
                expiresAt = expiresAt,
            )
        return sessionRepository.save(session)
    }

    fun deleteSession(session: Session) {
        logger.info("Deleting session with id = ${session.id}")

        session.deletedAt = OffsetDateTime.now()
        sessionRepository.save(session)

        logger.info("Finished deleting session")
    }
}
