package io.leonfoliveira.judge.api.util

import io.leonfoliveira.judge.core.service.quota.QuotaService
import java.time.temporal.ChronoUnit
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Before
import org.springframework.stereotype.Component

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class Quota(val value: Int, val per: ChronoUnit)

@Aspect
@Component
class QuotaAspect(
    private val quotaService: QuotaService,
) {
    @Before("@annotation(quotaAnnotation)")
    fun checkQuota(
        joinPoint: JoinPoint,
        quotaAnnotation: Quota,
    ) {
        val methodIdentifier = "${joinPoint.signature.declaringTypeName}.${joinPoint.signature.name}(${joinPoint.args.joinToString(
            ",",
        ) { it::class.simpleName ?: "Unknown" }})"
        val authorization = AuthorizationContextUtil.getAuthorization()
        quotaService.consume(authorization, methodIdentifier, quotaAnnotation.value, quotaAnnotation.per)
    }
}
