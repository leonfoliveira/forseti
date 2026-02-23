package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk

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

        test("should throw NotFoundException when session is not found") {
            every { sessionRepository.findByIdAndContestId(command.sessionId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should return session when session is found") {
            val session = SessionMockBuilder.build()
            every { sessionRepository.findByIdAndContestId(command.sessionId, contextContestId) } returns session

            val result = sut.execute(command)

            result shouldBe session
        }
    })
