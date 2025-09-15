package io.github.leonfoliveira.judge.common.domain.entity.aud

import io.github.leonfoliveira.judge.common.domain.entity.Session
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import org.slf4j.MDC
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class MemberRevisionListenerTest :
    FunSpec({
        val sut = MemberRevisionListener()

        class MockAuthorization(
            val session: Session,
        ) : Authentication {
            override fun getAuthorities() = emptyList<org.springframework.security.core.GrantedAuthority>()

            override fun getCredentials() = null

            override fun getDetails() = null

            override fun getPrincipal() = session

            override fun getName() = null

            override fun isAuthenticated() = true

            override fun setAuthenticated(isAuthenticated: Boolean) {}
        }

        test("should not set sessionId and traceId if no authentication is present") {
            SecurityContextHolder.clearContext()
            val revisionEntity = MemberRevisionEntity()

            sut.newRevision(revisionEntity)

            revisionEntity.sessionId shouldBe null
            revisionEntity.traceId shouldBe null
        }

        test("should set memberId and traceId in new revision") {
            val revisionEntity = MemberRevisionEntity()
            val sessionId = UUID.randomUUID()
            SecurityContextHolder.getContext().authentication =
                MockAuthorization(
                    SessionMockBuilder.build(
                        id = sessionId,
                    ),
                )
            val traceId = "test-trace-id"
            MDC.put("traceId", traceId)

            sut.newRevision(revisionEntity)

            revisionEntity.sessionId shouldBe sessionId
            revisionEntity.traceId shouldBe traceId
        }
    })
