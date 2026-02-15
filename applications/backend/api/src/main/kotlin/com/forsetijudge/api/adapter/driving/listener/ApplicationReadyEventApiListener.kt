package com.forsetijudge.api.adapter.driving.listener

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.member.UpdatePasswordMemberUseCase
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class ApplicationReadyEventApiListener(
    private val updatePasswordMemberUseCase: UpdatePasswordMemberUseCase,
    @Value("\${security.root.password}")
    private val rootPassword: String,
) {
    /**
     * Updates the root user's password when the application is ready.
     */
    @EventListener(ApplicationReadyEvent::class)
    fun updateRootPassword() {
        updatePasswordMemberUseCase.update(Member.ROOT_ID, rootPassword)
    }
}
