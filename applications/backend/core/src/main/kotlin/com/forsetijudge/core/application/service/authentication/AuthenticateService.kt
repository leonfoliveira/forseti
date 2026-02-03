package com.forsetijudge.core.application.service.authentication

import com.forsetijudge.core.application.service.session.CreateSessionService
import com.forsetijudge.core.application.service.session.DeleteSessionService
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.port.driven.Hasher
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.authentication.AuthenticateUseCase
import com.forsetijudge.core.port.dto.input.authorization.AuthenticateInputDTO
import com.forsetijudge.core.port.dto.input.authorization.ContestAuthenticateInputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AuthenticateService(
    private val memberRepository: MemberRepository,
    private val hasher: Hasher,
    private val createSessionService: CreateSessionService,
    private val deleteSessionService: DeleteSessionService,
    private val contestRepository: ContestRepository,
) : AuthenticateUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    companion object {
        val FORBIDDEN_MEMBER_TYPES = listOf(Member.Type.API, Member.Type.AUTOJUDGE)
    }

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
        if (FORBIDDEN_MEMBER_TYPES.contains(member.type)) {
            throw UnauthorizedException("Invalid login or password")
        }

        if (!hasher.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        deleteSessionService.deleteAllForMember(member)
        val session = createSessionService.create(null, member)
        logger.info("Finished authenticating member with session id = ${session.id}")
        return session
    }

    /**
     * Authenticates a member for a specific contest and creates a session.
     *
     * @param contestId The ID of the contest.
     * @param inputDTO The contest authentication input data.
     * @return The created session.
     * @throws NotFoundException if the contest is not found.
     * @throws UnauthorizedException if the login or password is invalid.
     */
    @Transactional
    override fun authenticateToContest(
        contestId: UUID,
        inputDTO: ContestAuthenticateInputDTO,
    ): Session {
        logger.info("Authenticating member for contest with id = $contestId")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Contest with id $contestId not found")
        val member =
            memberRepository.findByLoginAndContestId(inputDTO.login, contestId)
                ?: memberRepository.findByLoginAndContestId(inputDTO.login, null)
                ?: throw UnauthorizedException("Invalid login or password")

        if (FORBIDDEN_MEMBER_TYPES.contains(member.type)) {
            throw UnauthorizedException("Invalid login or password")
        }

        if (!hasher.verify(inputDTO.password, member.password)) {
            throw UnauthorizedException("Invalid login or password")
        }

        deleteSessionService.deleteAllForMember(member)
        val session = createSessionService.create(contest, member)
        logger.info("Finished authenticating member for contest with session id = ${session.id}")
        return session
    }
}
