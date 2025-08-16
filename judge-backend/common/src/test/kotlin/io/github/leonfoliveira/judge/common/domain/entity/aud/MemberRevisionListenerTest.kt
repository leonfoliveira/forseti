package io.github.leonfoliveira.judge.common.domain.entity.aud

import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import org.slf4j.MDC
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class MemberRevisionListenerTest : FunSpec({
    val sut = MemberRevisionListener()

    class MockAuthorization(val authorization: Authorization) : Authentication {
        override fun getAuthorities() = emptyList<org.springframework.security.core.GrantedAuthority>()

        override fun getCredentials() = null

        override fun getDetails() = null

        override fun getPrincipal() = authorization

        override fun getName() = authorization.member.name

        override fun isAuthenticated() = true

        override fun setAuthenticated(isAuthenticated: Boolean) {}
    }

    test("should not set memberId and traceId if no authentication is present") {
        SecurityContextHolder.clearContext()
        val revisionEntity = MemberRevisionEntity()

        sut.newRevision(revisionEntity)

        revisionEntity.memberId shouldBe null
        revisionEntity.traceId shouldBe null
    }

    test("should set memberId and traceId in new revision") {
        val revisionEntity = MemberRevisionEntity()
        val memberId = UUID.randomUUID()
        SecurityContextHolder.getContext().authentication =
            MockAuthorization(
                AuthorizationMockBuilder.build(
                    member = AuthorizationMockBuilder.buildMember(id = memberId),
                ),
            )
        val traceId = "test-trace-id"
        MDC.put("traceId", traceId)

        sut.newRevision(revisionEntity)

        revisionEntity.memberId shouldBe memberId
        revisionEntity.traceId shouldBe traceId
    }
})
