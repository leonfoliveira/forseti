package live.forseti.core.application.service.authentication

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import live.forseti.core.application.service.session.CreateSessionService
import live.forseti.core.domain.entity.MemberMockBuilder
import live.forseti.core.domain.entity.SessionMockBuilder
import live.forseti.core.domain.exception.UnauthorizedException
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driven.Hasher
import live.forseti.core.port.driven.repository.MemberRepository
import live.forseti.core.port.driven.repository.SessionRepository
import live.forseti.core.port.dto.input.authorization.AuthenticateInputDTO
import live.forseti.core.port.dto.input.authorization.ContestAuthenticateInputDTO
import java.util.UUID

class AuthenticateServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val hasher = mockk<Hasher>(relaxed = true)
        val createSessionService = mockk<CreateSessionService>(relaxed = true)

        val sut =
            AuthenticateService(
                memberRepository = memberRepository,
                hasher = hasher,
                createSessionService = createSessionService,
            )

        beforeEach {
            clearAllMocks()
        }

        context("authenticate") {
            val inputDTO = AuthenticateInputDTO("testLogin", "testPassword")

            test("should throw UnauthorizedException when member is not found") {
                every { memberRepository.findByLoginAndContestId(inputDTO.login, null) } returns null

                shouldThrow<UnauthorizedException> {
                    sut.authenticate(inputDTO)
                }.message shouldBe "Invalid login or password"
            }

            test("should throw UnauthorizedException when password does not match") {
                val member = MemberMockBuilder.build()
                every { memberRepository.findByLoginAndContestId(inputDTO.login, null) } returns member
                every { hasher.verify(inputDTO.password, member.password) } returns false

                shouldThrow<UnauthorizedException> {
                    sut.authenticate(inputDTO)
                }.message shouldBe "Invalid login or password"
            }

            test("should return Session when authentication is successful") {
                val member = MemberMockBuilder.build(login = "root")
                every { memberRepository.findByLoginAndContestId(inputDTO.login, null) } returns member
                every { hasher.verify(inputDTO.password, member.password) } returns true
                val session = SessionMockBuilder.build()
                every { createSessionService.create(any()) } returns session

                val result = sut.authenticate(inputDTO)

                result shouldBe session
            }
        }

        context("authenticate to contest") {
            val contestId = UUID.randomUUID()
            val inputDTO = ContestAuthenticateInputDTO("testLogin", "testPassword")

            test("should throw UnauthorizedException when member is not found") {
                every { memberRepository.findByLoginAndContestId(inputDTO.login, contestId) } returns null

                shouldThrow<UnauthorizedException> {
                    sut.authenticateToContest(contestId, inputDTO)
                }.message shouldBe "Invalid login or password"
            }

            test("should throw UnauthorizedException when password does not match") {
                val member = MemberMockBuilder.build()
                every { memberRepository.findByLoginAndContestId(inputDTO.login, contestId) } returns member
                every { hasher.verify(inputDTO.password, member.password) } returns false

                shouldThrow<UnauthorizedException> {
                    sut.authenticateToContest(contestId, inputDTO)
                }.message shouldBe "Invalid login or password"
            }

            test("should return Session when authentication is successful") {
                val member = MemberMockBuilder.build(login = inputDTO.login)
                every { memberRepository.findByLoginAndContestId(inputDTO.login, contestId) } returns member
                every { hasher.verify(inputDTO.password, member.password) } returns true
                val session = SessionMockBuilder.build()
                every { createSessionService.create(any()) } returns session

                val result = sut.authenticateToContest(contestId, inputDTO)

                result shouldBe session
            }
        }
    })
