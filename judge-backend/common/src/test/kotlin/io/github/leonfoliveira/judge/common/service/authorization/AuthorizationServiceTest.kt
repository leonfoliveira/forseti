package io.github.leonfoliveira.judge.common.service.authorization

import io.github.leonfoliveira.judge.common.domain.exception.InternalServerException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.port.JwtAdapter
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.AuthenticateInputDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime
import java.util.Optional
import java.util.UUID

class AuthorizationServiceTest : FunSpec({
    val memberRepository = mockk<MemberRepository>(relaxed = true)
    val contestRepository = mockk<ContestRepository>(relaxed = true)
    val hashAdapter = mockk<HashAdapter>(relaxed = true)
    val jwtAdapter = mockk<JwtAdapter>(relaxed = true)

    val sut =
        AuthorizationService(
            memberRepository = memberRepository,
            contestRepository = contestRepository,
            hashAdapter = hashAdapter,
            jwtAdapter = jwtAdapter,
        )

    beforeEach {
        clearAllMocks()
    }

    context("authenticate") {
        val inputDTO = AuthenticateInputDTO("testLogin", "testPassword")

        test("should throw UnauthorizedException when member is not found") {
            every { memberRepository.findByLogin(inputDTO.login) } returns null

            shouldThrow<UnauthorizedException> {
                sut.authenticate(inputDTO)
            }.message shouldBe "Invalid login or password"
        }

        test("should throw UnauthorizedException when member is system") {
            val member = MemberMockBuilder.build(isSystem = true)
            every { memberRepository.findByLogin(inputDTO.login) } returns member

            shouldThrow<UnauthorizedException> {
                sut.authenticate(inputDTO)
            }.message shouldBe "Invalid login or password"
        }

        test("should throw UnauthorizedException when password does not match") {
            val member = MemberMockBuilder.build()
            every { memberRepository.findByLogin(inputDTO.login) } returns member
            every { hashAdapter.verify(inputDTO.password, member.password) } returns false

            shouldThrow<UnauthorizedException> {
                sut.authenticate(inputDTO)
            }.message shouldBe "Invalid login or password"
        }

        test("should return Authorization when authentication is successful") {
            val member = MemberMockBuilder.build()
            every { memberRepository.findByLogin(inputDTO.login) } returns member
            every { hashAdapter.verify(inputDTO.password, member.password) } returns true
            val authorization = AuthorizationMockBuilder.build()
            every { jwtAdapter.generateAuthorization(member) } returns authorization

            val result = sut.authenticate(inputDTO)

            result shouldBe authorization
        }
    }

    context("authenticateAutoJudge") {
        test("should throw InternalServerException when autojudge member is not found") {
            every { memberRepository.findByLogin("autojudge") } returns null

            shouldThrow<InternalServerException> {
                sut.authenticateAutoJudge()
            }.message shouldBe "Could not find autojudge member"
        }

        test("should return Authorization when autojudge authentication is successful") {
            val member = MemberMockBuilder.build(login = "autojudge")
            every { memberRepository.findByLogin("autojudge") } returns member
            val authorization = AuthorizationMockBuilder.build()
            every { jwtAdapter.generateAuthorization(member) } returns authorization

            val result = sut.authenticateAutoJudge()

            result shouldBe authorization
        }
    }

    context("authenticateForContest") {
        val contestId = UUID.randomUUID()
        val inputDTO = AuthenticateInputDTO("testLogin", "testPassword")

        test("should throw NotFoundException when contest is not found") {
            every { contestRepository.findById(contestId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.authenticateForContest(contestId, inputDTO)
            }.message shouldBe "Could not find contest with id = $contestId"
        }

        test("should throw UnauthorizedException when contest is not active") {
            val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1), endAt = OffsetDateTime.now().plusHours(2))
            every { contestRepository.findById(contestId) } returns Optional.of(contest)

            shouldThrow<UnauthorizedException> {
                sut.authenticateForContest(contestId, inputDTO)
            }.message shouldBe "Contest is not active"
        }

        test("should throw UnauthorizedException when member is not found in contest") {
            val contest =
                ContestMockBuilder.build(
                    startAt = OffsetDateTime.now().minusHours(1),
                    endAt = OffsetDateTime.now().plusHours(1),
                    members = emptyList(),
                )
            every { contestRepository.findById(contestId) } returns Optional.of(contest)

            shouldThrow<UnauthorizedException> {
                sut.authenticateForContest(contestId, inputDTO)
            }.message shouldBe "Invalid login or password"
        }

        test("should throw UnauthorizedException when password does not match") {
            val member = MemberMockBuilder.build()
            val contest =
                ContestMockBuilder.build(
                    startAt = OffsetDateTime.now().minusHours(1),
                    endAt = OffsetDateTime.now().plusHours(1),
                    members = listOf(member),
                )
            every { contestRepository.findById(contestId) } returns Optional.of(contest)
            every { hashAdapter.verify(inputDTO.password, member.password) } returns false

            shouldThrow<UnauthorizedException> {
                sut.authenticateForContest(contestId, inputDTO)
            }.message shouldBe "Invalid login or password"
        }

        test("should return Authorization when authentication for contest is successful") {
            val member = MemberMockBuilder.build(login = inputDTO.login)
            val contest =
                ContestMockBuilder.build(
                    startAt = OffsetDateTime.now().minusHours(1),
                    endAt = OffsetDateTime.now().plusHours(1),
                    members = listOf(member),
                )
            every { contestRepository.findById(contestId) } returns Optional.of(contest)
            every { hashAdapter.verify(inputDTO.password, member.password) } returns true
            val authorization = AuthorizationMockBuilder.build()
            every { jwtAdapter.generateAuthorization(member) } returns authorization

            val result = sut.authenticateForContest(contestId, inputDTO)

            result shouldBe authorization
        }
    }
})
