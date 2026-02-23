package com.forsetijudge.core.domain.model

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class ExecutionContextTest :
    FunSpec({
        val ip = "0.0.0.0"
        val traceId = IdGenerator.getTraceId()
        val contestId = IdGenerator.getUUID()
        val contest = ContestMockBuilder.build(id = contestId)
        val session = SessionMockBuilder.build(contest = contest).toResponseBodyDTO()

        test("ExecutionContext should be initialized with correct values") {
            ExecutionContext.set(
                ip = ip,
                traceId = traceId,
                contestId = contestId,
                session = session,
            )

            ExecutionContext.get().ip shouldBe ip
            ExecutionContext.get().traceId shouldBe traceId
            ExecutionContext.get().contestId shouldBe contestId
            ExecutionContext.get().session shouldBe session
        }
    })
