package com.forsetijudge.core.application.service.internal.session

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.application.util.UnitUtil
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.internal.session.CreateSessionInternalUseCase
import com.forsetijudge.core.port.driving.usecase.internal.session.DeleteAllSessionsByMemberInternalUseCase
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class CreateSessionInternalService(
    private val sessionRepository: SessionRepository,
    private val deleteAllSessionsByMemberInternalUseCase: DeleteAllSessionsByMemberInternalUseCase,
    @Value("\${security.session.expiration.default}")
    private val defaultExpiration: String,
    @Value("\${security.session.expiration.root}")
    private val rootExpiration: String,
    @Value("\${security.session.expiration.system}")
    private val systemExpiration: String,
) : CreateSessionInternalUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun execute(command: CreateSessionInternalUseCase.Command): Session {
        logger.info("Creating session for member with id = {} in contest with id = {}", command.member.id, command.contest?.id)

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
                contest = command.contest,
                member = command.member,
                csrfToken = IdGenerator.getUUID(),
                expiresAt = ExecutionContext.getStartAt().plusSeconds(expiresAtOffset / 1000),
            )
        sessionRepository.save(session)

        logger.info("Session created successfully with id = {}", session.id)
        return session
    }
}
