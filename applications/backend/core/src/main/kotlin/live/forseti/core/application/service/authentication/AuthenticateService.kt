package live.forseti.core.application.service.authentication

import live.forseti.core.application.service.session.CreateSessionService
import live.forseti.core.domain.entity.Session
import live.forseti.core.domain.exception.UnauthorizedException
import live.forseti.core.port.driven.Hasher
import live.forseti.core.port.driven.repository.MemberRepository
import live.forseti.core.port.driving.usecase.authentication.AuthenticateUseCase
import live.forseti.core.port.dto.input.authorization.AuthenticateInputDTO
import live.forseti.core.port.dto.input.authorization.ContestAuthenticateInputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AuthenticateService(
    private val memberRepository: MemberRepository,
    private val hasher: Hasher,
    private val createSessionService: CreateSessionService,
) : AuthenticateUseCase {
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

        if (!hasher.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        val session = createSessionService.create(member)
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

        if (!hasher.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        val session = createSessionService.create(member)
        logger.info("Finished authenticating member for contest with session id = ${session.id}")
        return session
    }
}
