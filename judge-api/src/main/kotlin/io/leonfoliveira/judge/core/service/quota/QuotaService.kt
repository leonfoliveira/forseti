package io.leonfoliveira.judge.core.service.quota

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.port.QuotaAdapter
import java.time.temporal.ChronoUnit
import java.time.temporal.TemporalUnit
import org.springframework.stereotype.Service

@Service
class QuotaService(
    private val quotaAdapter: QuotaAdapter,
) {
    fun consume(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
        per: TemporalUnit,
    ) {
        if (member.type === Member.Type.ROOT) {
            return
        }

        if (!quotaAdapter.hasQuota(member, operation, quota)) {
            throw ForbiddenException("Quota exceeded for this operation")
        }

        quotaAdapter.consume(member, operation, quota, per)
    }
}
