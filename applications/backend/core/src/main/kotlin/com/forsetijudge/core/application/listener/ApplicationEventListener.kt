package com.forsetijudge.core.application.listener

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationEvent

abstract class ApplicationEventListener {
    @Value("\${security.member-login}")
    private lateinit var memberLogin: String

    @Value("\${security.member-type}")
    private lateinit var memberType: Member.Type

    @Autowired
    private lateinit var authenticateSystemUseCase: AuthenticateSystemUseCase

    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Handles the given business event.
     *
     * @param event The business event to handle.
     */
    open fun onApplicationEvent(event: ApplicationEvent) {
        ExecutionContext.start()

        logger.info("Handling application event of type: {}", event::class.java.simpleName)

        authenticateSystemUseCase.execute(
            AuthenticateSystemUseCase.Command(
                login = memberLogin,
                type = memberType,
            ),
        )

        logger.info("Finished application business event of type: {}", event::class.java.simpleName)
    }
}
