package io.github.leonfoliveira.forseti.autojudge.application.config

import io.github.leonfoliveira.forseti.common.application.port.driven.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.application.service.authentication.AuthenticationService
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.entity.Session
import live.forseti.core.domain.model.RequestContext
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.Scheduled
import java.time.OffsetDateTime

@Configuration
class AutoJudgeConfig(
    val authenticationService: AuthenticationService,
    memberRepository: MemberRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    val autoJudgeMember = memberRepository.findEntityById(Member.AUTOJUDGE_ID)!!

    var currentSession: Session = refreshSession()

    /**
     * Refreshes the AutoJudge session.
     */
    private fun refreshSession(): Session {
        val session = authenticationService.createSession(autoJudgeMember)
        RequestContext.getContext().session = session
        return session
    }

    /**
     * Scheduled task to refresh the AutoJudge session every minute if it's about to expire.
     */
    @Scheduled(fixedRate = 60 * 1000, initialDelay = 60 * 1000)
    private fun refreshSessionSchedule() {
        if (currentSession.expiresAt.isAfter(OffsetDateTime.now().plusMinutes(1))) {
            logger.info("Current AutoJudge session is still valid, no need to refresh")
        } else {
            currentSession = refreshSession()
            logger.info("Refreshing AutoJudge session")
        }
    }
}
