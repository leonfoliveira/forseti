package io.leonfoliveira.judge.core.service.quota

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.port.QuotaAdapter
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class QuotaService(
    private val quotaAdapter: QuotaAdapter,
) {
    fun consume(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
        window: Duration,
    ) {
        if (member.type === Member.Type.ROOT) {
            return
        }

        if (!quotaAdapter.hasQuota(member, operation, quota, window)) {
            throw ForbiddenException("Quota exceeded for this operation")
        }

        quotaAdapter.consume(member, operation, quota, window)
    }
}
