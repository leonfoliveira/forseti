package io.leonfoliveira.judge.core.service.quota

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.port.QuotaAdapter
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class QuotaService(
    private val quotaAdapter: QuotaAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun consume(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
        window: Duration,
    ) {
        logger.info("Consuming quota for member: ${member.id}, operation: $operation, quota: $quota, window: $window")

        if (member.type === Member.Type.ROOT) {
            logger.info("Skipping quota check for ROOT member")
            return
        }

        if (!quotaAdapter.hasQuota(member, operation, quota, window)) {
            throw ForbiddenException("Quota exceeded for this operation")
        }

        quotaAdapter.consume(member, operation, quota, window)
        logger.info("Finished consuming quota")
    }
}
