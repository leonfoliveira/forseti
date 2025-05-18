package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import java.time.temporal.ChronoUnit
import java.time.temporal.TemporalUnit

interface QuotaAdapter {
    fun hasQuota(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
    ): Boolean

    fun consume(
        member: AuthorizationMember,
        operation: String,
        quota: Int,
        per: TemporalUnit,
    )
}
