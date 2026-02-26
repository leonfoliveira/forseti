package com.forsetijudge.api.application.listener

import com.forsetijudge.core.application.listener.ApplicationEventListener
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.member.UpdateMemberPasswordUseCase
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.orm.ObjectOptimisticLockingFailureException
import org.springframework.stereotype.Component

@Component
class ApplicationReadyEventListener(
    private val updateMemberPasswordUseCase: UpdateMemberPasswordUseCase,
    @Value("\${security.root.password}")
    private val rootPassword: String,
) : ApplicationEventListener() {
    private val logger = SafeLogger(this::class)

    /**
     * Updates the root user's password when the application is ready.
     */
    @EventListener(ApplicationReadyEvent::class)
    fun onApplicationReady(event: ApplicationReadyEvent) {
        super.onApplicationEvent(event)

        try {
            updateMemberPasswordUseCase.execute(
                UpdateMemberPasswordUseCase.Command(
                    memberId = Member.Companion.ROOT_ID,
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
}
