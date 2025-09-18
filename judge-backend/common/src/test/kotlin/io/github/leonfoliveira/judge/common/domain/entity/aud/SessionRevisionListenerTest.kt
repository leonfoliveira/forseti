package io.github.leonfoliveira.judge.common.domain.entity.aud

import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import io.github.leonfoliveira.judge.common.domain.model.SessionAuthentication
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class SessionRevisionListenerTest :
    FunSpec({
        val sut = SessionRevisionListener()

        test("should not set sessionId and traceId if no authentication is present") {
            SecurityContextHolder.clearContext()
            RequestContext.clearContext()
            val revisionEntity = SessionRevisionEntity()

            sut.newRevision(revisionEntity)

            revisionEntity.sessionId shouldBe null
            revisionEntity.ip shouldBe null
            revisionEntity.traceId shouldBe null
        }

        test("should set memberId and traceId in new revision") {
            val revisionEntity = SessionRevisionEntity()
            val sessionId = UUID.randomUUID()
            SecurityContextHolder.getContext().authentication =
                SessionAuthentication(
                    SessionMockBuilder.build(
                        id = sessionId,
                    ),
                )
            RequestContext.getCurrent().ip = "127.0.0.1"
            RequestContext.getCurrent().traceId = "test-trace-id"

            sut.newRevision(revisionEntity)

            revisionEntity.sessionId shouldBe sessionId
            revisionEntity.ip shouldBe "127.0.0.1"
            revisionEntity.traceId shouldBe "test-trace-id"
        }
    })
