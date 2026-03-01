package com.forsetijudge.core.application.service.internal.session

import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.cache.SessionCache
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.internal.session.DeleteAllSessionsByMemberInternalUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class DeleteAllSessionsByMemberInternalServiceTest :
    FunSpec({
        val sessionRepository = mockk<SessionRepository>(relaxed = true)
        val sessionCache = mockk<SessionCache>(relaxed = true)

        val sut =
            DeleteAllSessionsByMemberInternalService(
                sessionRepository = sessionRepository,
                sessionCache = sessionCache,
            )

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build()
        }

        test("should delete all sessions by member") {
            val member = MemberMockBuilder.build()
            val sessions = listOf(SessionMockBuilder.build(), SessionMockBuilder.build())
            every { sessionRepository.findAllByMemberIdAndExpiresAtGreaterThan(member.id, ExecutionContext.get().startedAt) } returns
                sessions

            sut.execute(DeleteAllSessionsByMemberInternalUseCase.Command(member = member))

            verify { sessionRepository.saveAll(sessions) }
            sessions.forEach { it.deletedAt == ExecutionContext.get().startedAt }
            verify { sessionCache.evictAll(sessions.map { it.toResponseBodyDTO() }) }
        }
    })
