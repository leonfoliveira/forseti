package live.forseti.core.application.service.session

import live.forseti.core.application.util.UnitUtil
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.entity.Session
import live.forseti.core.port.driven.Hasher
import live.forseti.core.port.driven.repository.MemberRepository
import live.forseti.core.port.driven.repository.SessionRepository
import live.forseti.core.port.driving.usecase.session.CreateSessionUsecase
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class CreateSessionService(
    private val sessionRepository: SessionRepository,
    @Value("\${security.session.expiration}")
    private val expiration: String,
    @Value("\${security.session.root-expiration}")
    private val rootExpiration: String,
    @Value("\${security.session.autojudge-expiration}")
    private val autoJudgeExpiration: String,
) : CreateSessionUsecase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates a session for a member.
     *
     * @param member The member for whom the session is created.
     * @return The created session.
     */
    @Transactional
    override fun create(member: Member): Session {
        logger.info("Creating session for member id = ${member.id}")

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
        sessionRepository.save(session)

        logger.info("Created session with id = ${session.id}")
        return session
    }
}
