package live.forseti.core.application.service.session

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.unmockkObject
import io.mockk.verify
import live.forseti.core.application.service.member.FindMemberService
import live.forseti.core.domain.entity.MemberMockBuilder
import live.forseti.core.domain.entity.SessionMockBuilder
import live.forseti.core.domain.model.RequestContext
import java.time.OffsetDateTime
import java.util.UUID

class RefreshSessionServiceTest :
    FunSpec({
        val createSessionService = mockk<CreateSessionService>(relaxed = true)
        val findMemberService = mockk<FindMemberService>(relaxed = true)

        val sut =
            RefreshSessionService(
                createSessionService = createSessionService,
                findMemberService = findMemberService,
            )

        beforeEach {
            clearAllMocks()
            mockkObject(RequestContext)
        }

        afterEach {
            unmockkObject(RequestContext)
        }

        context("refresh") {
            val memberId = UUID.randomUUID()
            val member = MemberMockBuilder.build(id = memberId)

            test("should create new session when no current session exists") {
                val mockContext = RequestContext(session = null)
                every { RequestContext.getContext() } returns mockContext
                every { findMemberService.findById(memberId) } returns member
                val newSession = SessionMockBuilder.build(member = member)
                every { createSessionService.create(member) } returns newSession

                val result = sut.refresh(memberId)

                result shouldBe newSession
                verify { findMemberService.findById(memberId) }
                verify { createSessionService.create(member) }
            }

            test("should create new session when current session is about to expire") {
                val expiringSession =
                    SessionMockBuilder.build(
                        member = member,
                        expiresAt = OffsetDateTime.now().plusSeconds(30), // Expires in 30 seconds, less than 1 minute threshold
                    )
                val mockContext = RequestContext(session = expiringSession)
                every { RequestContext.getContext() } returns mockContext
                every { findMemberService.findById(memberId) } returns member
                val newSession = SessionMockBuilder.build(member = member)
                every { createSessionService.create(member) } returns newSession

                val result = sut.refresh(memberId)

                result shouldBe newSession
                verify { findMemberService.findById(memberId) }
                verify { createSessionService.create(member) }
            }

            test("should create new session when current session belongs to different member") {
                val differentMember = MemberMockBuilder.build(id = UUID.randomUUID())
                val sessionForDifferentMember =
                    SessionMockBuilder.build(
                        member = differentMember,
                        expiresAt = OffsetDateTime.now().plusHours(1), // Valid session but for different member
                    )
                val mockContext = RequestContext(session = sessionForDifferentMember)
                every { RequestContext.getContext() } returns mockContext
                every { findMemberService.findById(memberId) } returns member
                val newSession = SessionMockBuilder.build(member = member)
                every { createSessionService.create(member) } returns newSession

                val result = sut.refresh(memberId)

                result shouldBe newSession
                verify { findMemberService.findById(memberId) }
                verify { createSessionService.create(member) }
            }

            test("should return current session when it is still valid and belongs to same member") {
                val validSession =
                    SessionMockBuilder.build(
                        member = member,
                        expiresAt = OffsetDateTime.now().plusHours(1), // Expires in 1 hour, well above 1 minute threshold
                    )
                val mockContext = RequestContext(session = validSession)
                every { RequestContext.getContext() } returns mockContext

                val result = sut.refresh(memberId)

                result shouldBe validSession
                verify(exactly = 0) { findMemberService.findById(any()) }
                verify(exactly = 0) { createSessionService.create(any()) }
            }
        }
    })
