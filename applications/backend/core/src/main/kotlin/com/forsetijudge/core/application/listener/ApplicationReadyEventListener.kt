package com.forsetijudge.core.application.listener

import com.forsetijudge.core.application.util.SessionCache
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.member.UpdateMemberPasswordUseCase
import io.opentelemetry.api.trace.Span
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.orm.ObjectOptimisticLockingFailureException
import org.springframework.stereotype.Component

@Component
class ApplicationReadyEventListener(
    private val updateMemberPasswordUseCase: UpdateMemberPasswordUseCase,
    private val sessionCache: SessionCache,
    @Value("\${security.root.password}")
    private val rootPassword: String,
) {
    private val logger = LoggerFactory.getLogger(ApplicationReadyEventListener::class.java)

    /**
     * Updates the root user's password when the application is ready.
     */
    @EventListener(ApplicationReadyEvent::class)
    fun updateRootPassword() {
        initExecutionContext()
        try {
            updateMemberPasswordUseCase.execute(
                UpdateMemberPasswordUseCase.Command(
                    memberId = Member.ROOT_ID,
                    password = rootPassword,
                ),
            )
        } catch (ex: ObjectOptimisticLockingFailureException) {
            logger.warn(
                "Skipping root password update due to optimistic locking failure. " +
                    "This may occur if another instance has already updated the password.",
            )
        }
    }

    private fun initExecutionContext() {
        ExecutionContext.set(
            ip = null,
            traceId = Span.current().spanContext.traceId,
            contestId = null,
            session = sessionCache.get(null, Member.API_ID),
        )
    }
}
