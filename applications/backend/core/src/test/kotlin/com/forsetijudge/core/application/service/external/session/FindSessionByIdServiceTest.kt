package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class FindSessionByIdServiceTest :
    FunSpec({
        val sessionRepository = mockk<SessionRepository>(relaxed = true)

        val sut =
            FindSessionByIdService(
                sessionRepository = sessionRepository,
            )

        val contextContestId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId = contextContestId)
        }

        val command = FindSessionByIdUseCase.Command(sessionId = IdGenerator.getUUID())

        test("should throw UnauthorizedException when session is not found") {
            every { sessionRepository.findById(command.sessionId) } returns null

            shouldThrow<UnauthorizedException> { sut.execute(command) }
        }

        test("should throw UnauthorizedException when session is expired") {
            val session = SessionMockBuilder.build(expiresAt = OffsetDateTime.now().minusHours(1))
            every { sessionRepository.findById(command.sessionId) } returns session

            shouldThrow<UnauthorizedException> { sut.execute(command) }
        }

        test("should return session when session is found") {
            val session = SessionMockBuilder.build(expiresAt = OffsetDateTime.now().plusHours(1))
            every { sessionRepository.findById(command.sessionId) } returns session

            val result = sut.execute(command)

            result shouldBe session
        }
    })
