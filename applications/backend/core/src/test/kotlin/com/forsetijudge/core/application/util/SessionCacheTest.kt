package com.forsetijudge.core.application.util

import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.session.CreateSessionUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import java.time.OffsetDateTime

class SessionCacheTest :
    FunSpec({
        val createSessionUseCase = mockk<CreateSessionUseCase>(relaxed = true)

        val now = OffsetDateTime.now()

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        test("should create session when not cached") {
            val sut = SessionCache(createSessionUseCase = createSessionUseCase)

            val memberId = IdGenerator.getUUID()
            val contestId = IdGenerator.getUUID()
            val command =
                CreateSessionUseCase.Command(
                    memberId = memberId,
                    contestId = contestId,
                )
            val newSession = SessionMockBuilder.build()
            every { createSessionUseCase.execute(command) } returns newSession

            val session = sut.get(contestId, memberId)

            session shouldBe newSession.toResponseBodyDTO()
        }

        test("should return cached session when valid") {
            val sut = SessionCache(createSessionUseCase = createSessionUseCase)

            val memberId = IdGenerator.getUUID()
            val contestId = IdGenerator.getUUID()
            val command =
                CreateSessionUseCase.Command(
                    memberId = memberId,
                    contestId = contestId,
                )
            val cachedSession =
                SessionMockBuilder.build(
                    expiresAt = OffsetDateTime.now().plusHours(1),
                )
            every { createSessionUseCase.execute(command) } returns cachedSession

            sut.get(contestId, memberId)

            val session = sut.get(contestId, memberId)
            session shouldBe cachedSession.toResponseBodyDTO()
        }

        test("should create new session when cached session expired") {
            val sut = SessionCache(createSessionUseCase = createSessionUseCase)

            val memberId = IdGenerator.getUUID()
            val contestId = IdGenerator.getUUID()
            val command =
                CreateSessionUseCase.Command(
                    memberId = memberId,
                    contestId = contestId,
                )
            val expiredSession =
                SessionMockBuilder.build(
                    expiresAt = OffsetDateTime.now().minusHours(1),
                )
            val newSession = SessionMockBuilder.build()
            every { createSessionUseCase.execute(command) } returnsMany
                listOf(
                    expiredSession,
                    newSession,
                )

            sut.get(contestId, memberId)

            val session = sut.get(contestId, memberId)
            session shouldBe newSession.toResponseBodyDTO()
        }
    })
