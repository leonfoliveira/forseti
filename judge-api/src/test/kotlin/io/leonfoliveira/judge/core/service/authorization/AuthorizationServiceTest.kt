package io.leonfoliveira.judge.core.service.authorization

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import io.leonfoliveira.judge.core.domain.model.Authorization
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.port.JwtAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.mockk.every
import io.mockk.mockk
import java.util.Optional

class AuthorizationServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()
    val hashAdapter = mockk<HashAdapter>()
    val jwtAdapter = mockk<JwtAdapter>()

    val sut =
        AuthorizationService(
            contestRepository = contestRepository,
            hashAdapter = hashAdapter,
            jwtAdapter = jwtAdapter,
        )

    context("authenticateRoot") {
        sut.rootPassword = "rootPassword"

        test("should throw UnauthorizedException when password is invalid") {
            shouldThrow<UnauthorizedException> {
                sut.authenticateRoot("invalidPassword")
            }
        }

        test("should return AuthorizationOutput when password is valid") {
            every { jwtAdapter.generateToken(any()) }
                .returns("generatedToken")

            val result = sut.authenticateRoot("rootPassword")

            result.authorization shouldBe Authorization.ROOT
            result.token shouldBe "generatedToken"
        }
    }

    context("authenticateMember") {
        val contestId = 1
        val login = "login"
        val password = "password"
        val member = MemberMockFactory.build(login = login)
        val contest = ContestMockFactory.build(members = listOf(member))

        beforeEach {
            every { contestRepository.findById(contestId) } returns Optional.of(contest)
        }

        test("should throw NotFoundException when contest is not found") {
            every { contestRepository.findById(contestId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.authenticateMember(contestId, login, password)
            }
        }

        test("should throw UnauthorizedException when member is not found") {
            every { contestRepository.findById(contestId) } returns Optional.of(ContestMockFactory.build())

            shouldThrow<UnauthorizedException> {
                sut.authenticateMember(contestId, login, password)
            }
        }

        test("should throw UnauthorizedException when password is invalid") {
            every { hashAdapter.verify(password, member.password) } returns false

            shouldThrow<UnauthorizedException> {
                sut.authenticateMember(contestId, login, password)
            }
        }

        test("should return AuthorizationOutput when password is valid") {
            every { hashAdapter.verify(password, member.password) } returns true
            every { jwtAdapter.generateToken(any()) } returns "generatedToken"

            val result = sut.authenticateMember(contestId, login, password)

            result.authorization.id shouldBe member.id
            result.authorization.name shouldBe member.name
            result.authorization.login shouldBe member.login
            result.authorization.type shouldBe member.type
            result.token shouldBe "generatedToken"
        }
    }
})
