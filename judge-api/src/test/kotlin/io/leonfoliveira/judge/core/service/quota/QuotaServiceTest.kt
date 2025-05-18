package io.leonfoliveira.judge.core.service.quota

import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.domain.model.AuthorizationMemberMockFactory
import io.leonfoliveira.judge.core.port.QuotaAdapter
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.verify
import java.time.temporal.ChronoUnit

class QuotaServiceTest : FunSpec({
    val quotaAdapter = mockk<QuotaAdapter>()

    val sut = QuotaService(quotaAdapter)

    val member = AuthorizationMemberMockFactory.build()
    val operation = "operation"
    val quota = 1
    val per = ChronoUnit.MINUTES

    context("consume") {
        test("should not consume when the member is of type ROOT") {
            val member = AuthorizationMember.ROOT

            sut.consume(member, operation, quota, per)

            verify(exactly = 0) { quotaAdapter.hasQuota(member, operation, quota) }
            verify(exactly = 0) { quotaAdapter.consume(member, operation, quota, per) }
        }

        test("should throw ForbiddenException when the member has no quota") {
            every { quotaAdapter.hasQuota(member, operation, quota) } returns false

            shouldThrow<ForbiddenException> {
                sut.consume(member, operation, quota, per)
            }

            verify { quotaAdapter.hasQuota(member, operation, quota) }
            verify(exactly = 0) { quotaAdapter.consume(member, operation, quota, per) }
        }

        test("should consume when the member has quota") {
            every { quotaAdapter.hasQuota(member, operation, quota) } returns true
            every { quotaAdapter.consume(member, operation, quota, per) } just Runs

            sut.consume(member, operation, quota, per)

            verify { quotaAdapter.consume(member, operation, quota, per) }
        }
    }
})
