package com.forsetijudge.core.application.service.internal.session

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.application.util.UnitUtil
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.cache.SessionCache
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.internal.session.CreateSessionInternalUseCase
import com.forsetijudge.core.port.driving.usecase.internal.session.DeleteAllSessionsByMemberInternalUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class CreateSessionInternalService(
    private val sessionRepository: SessionRepository,
    private val deleteAllSessionsByMemberInternalUseCase: DeleteAllSessionsByMemberInternalUseCase,
    private val sessionCache: SessionCache,
    @Value("\${security.session.expiration.default}")
    private val defaultExpiration: String,
    @Value("\${security.session.expiration.root}")
    private val rootExpiration: String,
    @Value("\${security.session.expiration.system}")
    private val systemExpiration: String,
) : CreateSessionInternalUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(command: CreateSessionInternalUseCase.Command): Session {
        logger.info("Creating session for member with id = ${command.member.id}")

        deleteAllSessionsByMemberInternalUseCase.execute(DeleteAllSessionsByMemberInternalUseCase.Command(command.member))

        val expiresAtOffset =
            when (command.member.type) {
                Member.Type.ROOT -> UnitUtil.parseTimeValue(rootExpiration)
                Member.Type.API,
                Member.Type.AUTOJUDGE,
                -> UnitUtil.parseTimeValue(systemExpiration)
                else -> UnitUtil.parseTimeValue(defaultExpiration)
            }

        val session =
            Session(
                member = command.member,
                csrfToken = IdGenerator.getUUID(),
                expiresAt = ExecutionContext.get().startedAt.plusSeconds(expiresAtOffset / 1000),
            )
        sessionRepository.save(session)
        sessionCache.cache(session.toResponseBodyDTO())

        logger.info("Session created successfully with id = ${session.id}")
        return session
    }
}
