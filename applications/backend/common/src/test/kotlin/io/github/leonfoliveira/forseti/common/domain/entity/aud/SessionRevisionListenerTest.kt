package io.github.leonfoliveira.forseti.common.domain.entity.aud

import io.github.leonfoliveira.forseti.common.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import java.util.UUID

class SessionRevisionListenerTest :
    FunSpec({
        val sut = SessionRevisionListener()

        test("should not set sessionId and traceId if no authentication is present") {
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
            RequestContext.getContext().session =
                SessionMockBuilder.build(
                    id = sessionId,
                )
            RequestContext.getContext().ip = "127.0.0.1"
            RequestContext.getContext().traceId = "test-trace-id"

            sut.newRevision(revisionEntity)

            revisionEntity.sessionId shouldBe sessionId
            revisionEntity.ip shouldBe "127.0.0.1"
            revisionEntity.traceId shouldBe "test-trace-id"
        }
    })
