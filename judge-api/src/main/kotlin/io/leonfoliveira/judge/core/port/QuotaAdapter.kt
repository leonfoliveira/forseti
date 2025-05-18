package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import java.time.Duration

interface QuotaAdapter {
    fun hasQuota(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
        window: Duration,
    ): Boolean

    fun consume(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
        window: Duration,
    )
}
