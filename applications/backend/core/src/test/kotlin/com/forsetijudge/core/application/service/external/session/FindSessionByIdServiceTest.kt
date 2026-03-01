package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.cache.SessionCache
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime

class FindSessionByIdServiceTest :
    FunSpec({
        val sessionRepository = mockk<SessionRepository>(relaxed = true)
        val sessionCache = mockk<SessionCache>(relaxed = true)

        val sut =
            FindSessionByIdService(
                sessionRepository = sessionRepository,
                sessionCache = sessionCache,
            )

        val contextContestId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId = contextContestId)
        }

        val command = FindSessionByIdUseCase.Command(sessionId = IdGenerator.getUUID())

        test("should throw UnauthorizedException when session is not found") {
            every { sessionCache.get(command.sessionId) } returns null
            every { sessionRepository.findById(command.sessionId) } returns null

            shouldThrow<UnauthorizedException> { sut.execute(command) }
        }

        test("should throw UnauthorizedException when session is expired") {
            every { sessionCache.get(command.sessionId) } returns null
            val session = SessionMockBuilder.build(expiresAt = OffsetDateTime.now().minusHours(1))
            every { sessionRepository.findById(command.sessionId) } returns session

            shouldThrow<UnauthorizedException> { sut.execute(command) }
            verify { sessionCache.evict(session.toResponseBodyDTO()) }
        }

        test("should return session when session is found") {
            every { sessionCache.get(command.sessionId) } returns null
            val session = SessionMockBuilder.build(expiresAt = OffsetDateTime.now().plusHours(1))
            every { sessionRepository.findById(command.sessionId) } returns session

            val result = sut.execute(command)

            result shouldBe session.toResponseBodyDTO()
            verify { sessionCache.cache(session.toResponseBodyDTO()) }
        }

        test("should return session from cache when session is found in cache") {
            val session = SessionMockBuilder.build(expiresAt = OffsetDateTime.now().plusHours(1))
            every { sessionCache.get(command.sessionId) } returns session.toResponseBodyDTO()

            val result = sut.execute(command)

            result shouldBe session.toResponseBodyDTO()
        }
    })
