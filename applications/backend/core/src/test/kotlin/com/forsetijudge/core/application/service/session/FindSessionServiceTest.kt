package com.forsetijudge.core.application.service.session

import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.port.driven.repository.SessionRepository
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class FindSessionServiceTest :
    FunSpec({
        val sessionRepository = mockk<SessionRepository>(relaxed = true)

        val sut = FindSessionService(sessionRepository)

        context("findByIdNullable") {
            test("should call sessionRepository.findEntityById") {
                val session = SessionMockBuilder.build()
                every { sessionRepository.findEntityById(session.id) } returns session

                val result = sut.findByIdNullable(session.id)

                result shouldBe session
                verify { sessionRepository.findEntityById(session.id) }
            }
        }
    })
