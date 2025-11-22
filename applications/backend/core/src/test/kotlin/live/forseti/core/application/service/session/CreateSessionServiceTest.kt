package live.forseti.core.application.service.session

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.verify
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.entity.MemberMockBuilder
import live.forseti.core.domain.entity.Session
import live.forseti.core.port.driven.repository.SessionRepository
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

                val result = sut.create(member)

                verify { sessionRepository.save(any()) }
                val savedSession = sessionSlot.captured
                savedSession.member shouldBe member
                savedSession.expiresAt shouldBe now.plusSeconds(3600) // 1 hour
                result shouldBe savedSession
            }

            test("should create session for root member with extended expiration") {
                val member = MemberMockBuilder.build(type = Member.Type.ROOT)
                val sessionSlot = slot<Session>()
                every { sessionRepository.save(capture(sessionSlot)) } returnsArgument 0

                val result = sut.create(member)

                verify { sessionRepository.save(any()) }
                val savedSession = sessionSlot.captured
                savedSession.member shouldBe member
                savedSession.expiresAt shouldBe now.plusSeconds(86400) // 24 hours
                result shouldBe savedSession
            }

            test("should create session for autojudge member with autojudge expiration") {
                val member = MemberMockBuilder.build(type = Member.Type.AUTOJUDGE)
                val sessionSlot = slot<Session>()
                every { sessionRepository.save(capture(sessionSlot)) } returnsArgument 0

                val result = sut.create(member)

                verify { sessionRepository.save(any()) }
                val savedSession = sessionSlot.captured
                savedSession.member shouldBe member
                savedSession.expiresAt shouldBe now.plusSeconds(86400) // 1 day
                result shouldBe savedSession
            }

            test("should create session for contestant member with default expiration") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val sessionSlot = slot<Session>()
                every { sessionRepository.save(capture(sessionSlot)) } returnsArgument 0

                val result = sut.create(member)

                verify { sessionRepository.save(any()) }
                val savedSession = sessionSlot.captured
                savedSession.member shouldBe member
                savedSession.expiresAt shouldBe now.plusSeconds(3600) // 1 hour
                result shouldBe savedSession
            }
        }
    })
