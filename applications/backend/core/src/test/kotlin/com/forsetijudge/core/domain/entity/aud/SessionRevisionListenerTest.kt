package com.forsetijudge.core.domain.entity.aud

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks

class SessionRevisionListenerTest :
    FunSpec({
        val sut = SessionRevisionListener()

        beforeEach {
            clearAllMocks()
        }

        test("should not set sessionId if no authentication is present") {
            val revisionEntity = SessionRevisionEntity()
            ExecutionContext.start()

            sut.newRevision(revisionEntity)

            revisionEntity.sessionId shouldBe null
            revisionEntity.ip shouldBe null
        }

        test("should set memberId and traceId in new revision") {
            val revisionEntity = SessionRevisionEntity()
            val sessionId = IdGenerator.getUUID()
            val ip = "127.0.0.1"
            val traceId = IdGenerator.getTraceId()
            ExecutionContext.start(
                ip = ip,
                traceId = traceId,
            )
            ExecutionContext.authenticate(
                SessionMockBuilder
                    .build(
                        id = sessionId,
                    ),
            )

            sut.newRevision(revisionEntity)

            revisionEntity.sessionId shouldBe sessionId
            revisionEntity.ip shouldBe ip
            revisionEntity.traceId shouldBe traceId
        }
    })
