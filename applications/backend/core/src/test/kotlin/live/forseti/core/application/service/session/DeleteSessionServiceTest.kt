package live.forseti.core.application.service.session

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.slot
import io.mockk.unmockkObject
import io.mockk.verify
import live.forseti.core.domain.entity.SessionMockBuilder
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driven.repository.SessionRepository

class DeleteSessionServiceTest :
    FunSpec({
        val sessionRepository = mockk<SessionRepository>(relaxed = true)

        val sut = DeleteSessionService(sessionRepository)

        beforeEach {
            clearAllMocks()
            mockkObject(RequestContext)
        }

        afterEach {
            unmockkObject(RequestContext)
        }

        context("deleteCurrent") {
            test("should soft delete current session from request context") {
                val currentSession = SessionMockBuilder.build()
                val mockContext = RequestContext(session = currentSession)
                every { RequestContext.getContext() } returns mockContext
                val sessionSlot = slot<live.forseti.core.domain.entity.Session>()
                every { sessionRepository.save(capture(sessionSlot)) } returnsArgument 0

                sut.deleteCurrent()

                verify { sessionRepository.save(any()) }
                val savedSession = sessionSlot.captured
                savedSession.deletedAt shouldNotBe null
                savedSession shouldBe currentSession
            }

            test("should do nothing when no session exists in request context") {
                val mockContext = RequestContext(session = null)
                every { RequestContext.getContext() } returns mockContext

                sut.deleteCurrent()

                verify(exactly = 0) { sessionRepository.save(any()) }
            }
        }
    })
