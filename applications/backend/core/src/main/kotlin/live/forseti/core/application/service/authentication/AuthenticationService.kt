package live.forseti.core.application.service.authentication

import live.forseti.core.application.util.UnitUtil
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.entity.Session
import live.forseti.core.domain.exception.UnauthorizedException
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driven.HashAdapter
import live.forseti.core.port.driven.repository.MemberRepository
import live.forseti.core.port.driven.repository.SessionRepository
import live.forseti.core.port.driving.usecase.AuthenticationUseCase
import live.forseti.core.port.dto.input.authorization.AuthenticateInputDTO
import live.forseti.core.port.dto.input.authorization.ContestAuthenticateInputDTO
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
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
) : AuthenticationUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Authenticates a member and creates a session.
     *
     * @param inputDTO The authentication input data.
     * @return The created session.
     * @throws UnauthorizedException if the login or password is invalid.
     */
    @Transactional
    override fun authenticate(inputDTO: AuthenticateInputDTO): Session {
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

    /**
     * Authenticates a member for a specific contest and creates a session.
     *
     * @param contestId The ID of the contest.
     * @param inputDTO The contest authentication input data.
     * @return The created session.
     * @throws UnauthorizedException if the login or password is invalid.
     */
    @Transactional
    override fun authenticateToContest(
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

    /**
     * Creates a session for a member.
     *
     * @param member The member for whom the session is created.
     * @return The created session.
     */
    @Transactional
    override fun createSession(member: Member): Session {
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

    /**
     * Soft deletes the current session from RequestContext.
     */
    @Transactional
    override fun deleteCurrentSession() {
        logger.info("Deleting current session")

        val session = RequestContext.getContext().session
        if (session == null) {
            logger.info("No session found in request context")
            return
        }

        session.deletedAt = OffsetDateTime.now()
        sessionRepository.save(session)

        logger.info("Finished deleting session")
    }
}
