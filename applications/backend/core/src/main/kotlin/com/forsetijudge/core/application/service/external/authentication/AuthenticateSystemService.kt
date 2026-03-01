package com.forsetijudge.core.application.service.external.authentication

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.cache.SessionCache
import com.forsetijudge.core.port.driven.cryptography.Hasher
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.internal.session.CreateSessionInternalUseCase
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthenticateSystemService(
    private val memberRepository: MemberRepository,
    private val createSessionInternalUseCase: CreateSessionInternalUseCase,
    private val hasher: Hasher,
    private val sessionCache: SessionCache,
) : AuthenticateSystemUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(command: AuthenticateSystemUseCase.Command) {
        logger.info("Authenticating system member with login: ${command.login}")

        if (command.type !in setOf(Member.Type.API, Member.Type.AUTOJUDGE)) {
            throw ForbiddenException("Invalid member type for system member: ${command.type}")
        }

        val member = upsertSystemMember(command)
        val session = getSession(member)

        ExecutionContext.setSession(session)
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

    fun getSession(member: Member): SessionResponseBodyDTO {
        val cachedSession = sessionCache.getByMemberId(member.id)

        if (cachedSession != null) {
            if (cachedSession.expiresAt <= ExecutionContext.get().startedAt) {
                logger.info("Cached session with id: ${cachedSession.id} has expired")
                sessionCache.evict(cachedSession)
            } else {
                logger.info("Using cached session with id: ${cachedSession.id}")
                return cachedSession
            }
        }

        return createSession(member)
    }

    fun createSession(member: Member): SessionResponseBodyDTO {
        val session =
            createSessionInternalUseCase.execute(CreateSessionInternalUseCase.Command(member))
        logger.info("Created new session with id: ${session.id}")
        return session.toResponseBodyDTO()
    }
}
