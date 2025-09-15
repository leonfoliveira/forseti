package io.github.leonfoliveira.judge.common.service.authentication

import io.github.leonfoliveira.judge.common.domain.exception.InternalServerException
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.repository.SessionRepository
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.ContestAuthenticateInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.RootAuthenticateInputDTO
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
            )

        beforeEach {
            clearAllMocks()
        }

        context("authenticateAutoJudge") {
            test("should throw InternalServerException when autojudge member is not found") {
                every { memberRepository.findByLogin("autojudge") } returns null

                shouldThrow<InternalServerException> {
                    sut.authenticateAutoJudge()
                }.message shouldBe "Could not find autojudge member"
            }

            test("should return Session when autojudge authentication is successful") {
                val member = MemberMockBuilder.build(login = "autojudge")
                every { memberRepository.findByLogin("autojudge") } returns member
                val session = SessionMockBuilder.build()
                every { sessionRepository.save(any()) } returns session

                val result = sut.authenticateAutoJudge()

                result shouldBe session
            }
        }

        context("authenticateRoot") {
            test("should throw InternalServerException when root member is not found") {
                val inputDTO = RootAuthenticateInputDTO("testPassword")
                every { memberRepository.findByLogin("root") } returns null

                shouldThrow<InternalServerException> {
                    sut.authenticateRoot(inputDTO)
                }.message shouldBe "Could not find root member"
            }

            test("should throw UnauthorizedException when password does not match") {
                val inputDTO = RootAuthenticateInputDTO("testPassword")
                val member = MemberMockBuilder.build()
                every { memberRepository.findByLogin("root") } returns member
                every { hashAdapter.verify(inputDTO.password, member.password) } returns false

                shouldThrow<UnauthorizedException> {
                    sut.authenticateRoot(inputDTO)
                }.message shouldBe "Invalid password"
            }

            test("should return Session when root authentication is successful") {
                val inputDTO = RootAuthenticateInputDTO("testPassword")
                val member = MemberMockBuilder.build(login = "root")
                every { memberRepository.findByLogin("root") } returns member
                every { hashAdapter.verify(inputDTO.password, member.password) } returns true
                val session = SessionMockBuilder.build()
                every { sessionRepository.save(any()) } returns session

                val result = sut.authenticateRoot(inputDTO)

                result shouldBe session
            }
        }

        context("authenticate to contest") {
            val contestId = UUID.randomUUID()
            val inputDTO = ContestAuthenticateInputDTO("testLogin", "testPassword")

            test("should throw UnauthorizedException when member is not found") {
                every { memberRepository.findByLoginAndContestId(inputDTO.login, contestId) } returns null

                shouldThrow<UnauthorizedException> {
                    sut.authenticate(contestId, inputDTO)
                }.message shouldBe "Invalid login or password"
            }

            test("should throw UnauthorizedException when password does not match") {
                val member = MemberMockBuilder.build()
                every { memberRepository.findByLoginAndContestId(inputDTO.login, contestId) } returns member
                every { hashAdapter.verify(inputDTO.password, member.password) } returns false

                shouldThrow<UnauthorizedException> {
                    sut.authenticate(contestId, inputDTO)
                }.message shouldBe "Invalid login or password"
            }

            test("should return Session when authentication is successful") {
                val member = MemberMockBuilder.build(login = inputDTO.login)
                every { memberRepository.findByLoginAndContestId(inputDTO.login, contestId) } returns member
                every { hashAdapter.verify(inputDTO.password, member.password) } returns true
                val session = SessionMockBuilder.build()
                every { sessionRepository.save(any()) } returns session

                val result = sut.authenticate(contestId, inputDTO)

                result shouldBe session
            }
        }

        context("deleteSession") {
            test("should delete session successfully") {
                val session = SessionMockBuilder.build()
                every { sessionRepository.save(any()) } returns session

                sut.deleteSession(session)

                session.deletedAt.shouldNotBeNull()
                verify { sessionRepository.save(session) }
            }
        }
    })
