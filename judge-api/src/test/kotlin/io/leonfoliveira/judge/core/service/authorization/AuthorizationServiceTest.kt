package io.leonfoliveira.judge.core.service.authorization

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import io.leonfoliveira.judge.core.domain.model.Authorization
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.port.JwtAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.mockk.every
import io.mockk.mockk

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
        val member = mockk<Member>()
        val contest = mockk<Contest>()

        beforeEach {
            every { contest.members } returns listOf(member)
            every { member.login } returns login
            every { member.password } returns "hashedPassword"
            every { member.id } returns 1
            every { member.name } returns "name"
            every { member.type } returns Member.Type.CONTESTANT

            every { contestRepository.findById(contestId) } returns java.util.Optional.of(contest)
        }

        test("should throw NotFoundException when contest is not found") {
            every { contestRepository.findById(contestId) } returns java.util.Optional.empty()

            shouldThrow<NotFoundException> {
                sut.authenticateMember(contestId, login, password)
            }
        }

        test("should throw UnauthorizedException when member is not found") {
            every { contest.members } returns emptyList()

            shouldThrow<UnauthorizedException> {
                sut.authenticateMember(contestId, login, password)
            }
        }

        test("should throw UnauthorizedException when password is invalid") {
            every { hashAdapter.verify(password, "hashedPassword") } returns false

            shouldThrow<UnauthorizedException> {
                sut.authenticateMember(contestId, login, password)
            }
        }

        test("should return AuthorizationOutput when password is valid") {
            every { hashAdapter.verify(password, "hashedPassword") } returns true
            every { jwtAdapter.generateToken(any()) } returns "generatedToken"

            val result = sut.authenticateMember(contestId, login, password)

            result.authorization.id shouldBe 1
            result.authorization.name shouldBe "name"
            result.authorization.login shouldBe login
            result.authorization.type shouldBe Member.Type.CONTESTANT
            result.token shouldBe "generatedToken"
        }
    }
})
