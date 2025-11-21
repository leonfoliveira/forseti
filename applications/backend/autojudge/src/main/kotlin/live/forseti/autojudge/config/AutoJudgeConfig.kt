package live.forseti.autojudge.config

import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.member.FindMemberUseCase
import live.forseti.core.port.driving.usecase.session.CreateSessionUseCase
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.Scheduled

@Configuration
class AutoJudgeConfig(
    val createSessionUseCase: CreateSessionUseCase,
    findMemberUseCase: FindMemberUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    companion object {
        private const val SESSION_EXPIRATION_THRESHOLD_MINUTES = 1L
    }

    val autoJudgeMember = findMemberUseCase.findById(Member.AUTOJUDGE_ID)

    /**
     * Refreshes the AutoJudge session.
     */
    private fun refreshSession() {
        val session = createSessionUseCase.create(autoJudgeMember)
        RequestContext.getContext().session = session
    }

    /**
     * Scheduled task to refresh the AutoJudge session every minute if it's about to expire.
     */
    @Scheduled(fixedRate = 60 * 1000)
    private fun refreshSessionSchedule() {
        val session = RequestContext.getContext().session
        if (session == null || session.isAboutToExpire(SESSION_EXPIRATION_THRESHOLD_MINUTES)) {
            refreshSession()
            logger.info("Refreshing AutoJudge session")
        } else {
            logger.info("Current AutoJudge session is still valid, no need to refresh")
        }
    }
}
