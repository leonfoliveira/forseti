package io.leonfoliveira.judge.api.util

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTO
import io.leonfoliveira.judge.core.service.quota.QuotaService
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.verify
import java.time.Duration
import java.time.temporal.ChronoUnit

class QuotaAspectTest : FunSpec({
    val quotaService = mockk<QuotaService>()

    val sut = QuotaAspect(quotaService)

    test("should consume quota with correct method identifier and annotation values") {
        val authorization = AuthorizationMember.ROOT
        val methodIdentifier = "io.leonfoliveira.judge.api.controller.ContestController.updateContest(UpdateContestInputDTO)"
        val window = Duration.of(1, ChronoUnit.MINUTES)
        val quotaAnnotation = Quota(1, 1, ChronoUnit.MINUTES)

        mockkObject(AuthorizationContextUtil)
        every { AuthorizationContextUtil.getAuthorization() } returns authorization
        every { quotaService.consume(authorization, methodIdentifier, quotaAnnotation.value, window) } just Runs

        sut.checkQuota(
            mockk {
                every { signature.declaringTypeName } returns "io.leonfoliveira.judge.api.controller.ContestController"
                every { signature.name } returns "updateContest"
                every { args } returns arrayOf(mockk<UpdateContestInputDTO>())
            },
            quotaAnnotation,
        )

        verify {
            quotaService.consume(authorization, methodIdentifier, quotaAnnotation.value, window)
        }
    }
})
