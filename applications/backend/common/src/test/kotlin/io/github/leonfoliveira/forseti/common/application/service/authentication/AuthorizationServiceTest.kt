package io.github.leonfoliveira.forseti.common.application.service.authentication

import io.github.leonfoliveira.forseti.common.application.domain.exception.UnauthorizedException
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.application.port.driven.HashAdapter
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.SessionRepository
import io.github.leonfoliveira.forseti.common.application.service.dto.input.authorization.AuthenticateInputDTO
import io.github.leonfoliveira.forseti.common.application.service.dto.input.authorization.ContestAuthenticateInputDTO
import io.github.leonfoliveira.forseti.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.UUID

class AuthorizationServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val sessionRepository = mockk<SessionRepository>(relaxed = true)
        val hashAdapter = mockk<HashAdapter>(relaxed = true)

        val sut =
            AuthenticationService(
                memberRepository = memberRepository,
                sessionRepository = sessionRepository,
                hashAdapter = hashAdapter,
                expiration = "1000",
                rootExpiration = "1000",
                autoJudgeExpiration = "1000",
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
                every { hashAdapter.verify(inputDTO.password, member.password) } returns false

                shouldThrow<UnauthorizedException> {
                    sut.authenticate(inputDTO)
                }.message shouldBe "Invalid login or password"
            }

            test("should return Session when authentication is successful") {
                val member = MemberMockBuilder.build(login = "root")
                every { memberRepository.findByLoginAndContestId(inputDTO.login, null) } returns member
                every { hashAdapter.verify(inputDTO.password, member.password) } returns true
                val session = SessionMockBuilder.build()
                every { sessionRepository.save(any()) } returns session

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
                every { hashAdapter.verify(inputDTO.password, member.password) } returns false

                shouldThrow<UnauthorizedException> {
                    sut.authenticateToContest(contestId, inputDTO)
                }.message shouldBe "Invalid login or password"
            }

            test("should return Session when authentication is successful") {
                val member = MemberMockBuilder.build(login = inputDTO.login)
                every { memberRepository.findByLoginAndContestId(inputDTO.login, contestId) } returns member
                every { hashAdapter.verify(inputDTO.password, member.password) } returns true
                val session = SessionMockBuilder.build()
                every { sessionRepository.save(any()) } returns session

                val result = sut.authenticateToContest(contestId, inputDTO)

                result shouldBe session
            }
        }

        context("deleteSession") {
            test("should delete session successfully") {
                val session = SessionMockBuilder.build()
                every { sessionRepository.save(any()) } returns session
                RequestContext.getContext().session = session

                sut.deleteCurrentSession()

                session.deletedAt.shouldNotBeNull()
                verify { sessionRepository.save(session) }
            }
        }
    })
