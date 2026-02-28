package com.forsetijudge.core.application.service.external.authentication

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.cryptography.Hasher
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.driving.usecase.internal.session.CreateSessionInternalUseCase
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

@Service
class AuthenticateSystemService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val findSessionByIdUseCase: FindSessionByIdUseCase,
    private val createSessionInternalUseCase: CreateSessionInternalUseCase,
    private val hasher: Hasher,
) : AuthenticateSystemUseCase {
    private val logger = SafeLogger(this::class)

    private var cachedSessionByContestIdAndMemberId = ConcurrentHashMap<Pair<UUID?, UUID>, Session>()

    override fun execute(command: AuthenticateSystemUseCase.Command) {
        val contextContestId = ExecutionContext.getContestIdNullable()

        logger.info("Authenticating system member with login: ${command.login}")

        if (command.type !in setOf(Member.Type.API, Member.Type.AUTOJUDGE)) {
            throw ForbiddenException("Invalid member type for system member: ${command.type}")
        }

        val contest =
            contextContestId ?.let {
                contestRepository.findById(it)
                    ?: throw ForbiddenException("Could not find contest with id: $it")
            }

        val member = upsertSystemMember(command)
        val session = getSession(contest, member)

        ExecutionContext.authenticate(session)
        logger.info("System member authenticated successfully")
    }

    private fun upsertSystemMember(command: AuthenticateSystemUseCase.Command): Member {
        val existingMember = memberRepository.findByLoginAndContestIsNull(command.login)

        if (existingMember != null) {
            existingMember.name = command.login
            existingMember.login = command.login
            existingMember.type = command.type

            memberRepository.save(existingMember)

            logger.info("Updated existing system member with login: ${existingMember.login}")
            return existingMember
        } else {
            val newMember =
                Member(
                    name = command.login,
                    login = command.login,
                    type = command.type,
                    password = hasher.hash(IdGenerator.getUUID().toString()),
                )

            memberRepository.save(newMember)

            logger.info("Created new system member with login: ${newMember.login}")
            return newMember
        }
    }

    fun getSession(
        contest: Contest?,
        member: Member,
    ): Session {
        val key = Pair(contest?.id, member.id)
        val cachedSession = cachedSessionByContestIdAndMemberId[key]

        if (cachedSession != null) {
            return try {
                val existingSession =
                    findSessionByIdUseCase.execute(
                        FindSessionByIdUseCase.Command(
                            sessionId = cachedSession.id,
                        ),
                    )
                logger.info("Using cached session with id: ${existingSession.id}")
                existingSession
            } catch (ex: UnauthorizedException) {
                return createSession(contest, member)
            }
        }

        return createSession(contest, member)
    }

    fun createSession(
        contest: Contest?,
        member: Member,
    ): Session {
        val session =
            createSessionInternalUseCase.execute(CreateSessionInternalUseCase.Command(contest, member))

        val key = Pair(contest?.id, member.id)
        cachedSessionByContestIdAndMemberId[key] = session

        logger.info("Created new session with id: ${session.id}")
        return session
    }
}
