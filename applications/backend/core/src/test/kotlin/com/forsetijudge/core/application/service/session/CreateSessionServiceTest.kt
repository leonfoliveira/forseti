package com.forsetijudge.core.application.service.session

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.port.driven.repository.SessionRepository
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.verify
import java.time.OffsetDateTime

class CreateSessionServiceTest :
    FunSpec({
        val sessionRepository = mockk<SessionRepository>(relaxed = true)

        val sut =
            CreateSessionService(
                sessionRepository = sessionRepository,
                expiration = "1h",
                rootExpiration = "24h",
                autoJudgeExpiration = "1d",
            )

        val now = OffsetDateTime.now()

        beforeEach {
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        context("create") {
            test("should create session for regular member with default expiration") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val sessionSlot = slot<Session>()
                every { sessionRepository.save(capture(sessionSlot)) } returnsArgument 0

                val result = sut.create(null, member)

                verify { sessionRepository.save(any()) }
                val savedSession = sessionSlot.captured
                savedSession.member shouldBe member
                savedSession.contest shouldBe null
                savedSession.expiresAt shouldBe now.plusSeconds(3600) // 1 hour
                result shouldBe savedSession
            }

            test("should create session for root member with extended expiration") {
                val member = MemberMockBuilder.build(type = Member.Type.ROOT)
                val sessionSlot = slot<Session>()
                every { sessionRepository.save(capture(sessionSlot)) } returnsArgument 0

                val result = sut.create(null, member)

                verify { sessionRepository.save(any()) }
                val savedSession = sessionSlot.captured
                savedSession.member shouldBe member
                savedSession.contest shouldBe null
                savedSession.expiresAt shouldBe now.plusSeconds(86400) // 24 hours
                result shouldBe savedSession
            }

            test("should create session for autojudge member with autojudge expiration") {
                val member = MemberMockBuilder.build(type = Member.Type.AUTOJUDGE)
                val sessionSlot = slot<Session>()
                every { sessionRepository.save(capture(sessionSlot)) } returnsArgument 0

                val result = sut.create(null, member)

                verify { sessionRepository.save(any()) }
                val savedSession = sessionSlot.captured
                savedSession.member shouldBe member
                savedSession.contest shouldBe null
                savedSession.expiresAt shouldBe now.plusSeconds(86400) // 1 day
                result shouldBe savedSession
            }

            test("should create session for contestant member with default expiration") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val sessionSlot = slot<Session>()
                every { sessionRepository.save(capture(sessionSlot)) } returnsArgument 0

                val result = sut.create(null, member)

                verify { sessionRepository.save(any()) }
                val savedSession = sessionSlot.captured
                savedSession.member shouldBe member
                savedSession.contest shouldBe null
                savedSession.expiresAt shouldBe now.plusSeconds(3600) // 1 hour
                result shouldBe savedSession
            }

            test("should create session with contest when provided") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val sessionSlot = slot<Session>()
                every { sessionRepository.save(capture(sessionSlot)) } returnsArgument 0

                val result = sut.create(contest, member)

                verify { sessionRepository.save(any()) }
                val savedSession = sessionSlot.captured
                savedSession.member shouldBe member
                savedSession.contest shouldBe contest
                savedSession.expiresAt shouldBe now.plusSeconds(3600) // 1 hour
                result shouldBe savedSession
            }
        }
    })
