package io.leonfoliveira.judge.api.util

import io.leonfoliveira.judge.core.service.quota.QuotaService
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Before
import org.springframework.stereotype.Component
import java.time.Duration
import java.time.temporal.ChronoUnit

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class Quota(val value: Int, val windowAmount: Long, val windowUnit: ChronoUnit)

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
        quotaService.consume(
            authorization,
            methodIdentifier,
            quotaAnnotation.value,
            Duration.of(quotaAnnotation.windowAmount, quotaAnnotation.windowUnit),
        )
    }
}
