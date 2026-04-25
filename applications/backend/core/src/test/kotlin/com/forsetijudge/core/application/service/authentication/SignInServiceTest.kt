package com.forsetijudge.core.application.service.authentication

import com.forsetijudge.core.application.helper.session.SessionCreator
import com.forsetijudge.core.application.helper.session.SessionDeleter
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.cryptography.Hasher
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.authentication.SignInUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SignInServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val sessionCreator = mockk<SessionCreator>(relaxed = true)
        val sessionDeleter = mockk<SessionDeleter>(relaxed = true)
        val hasher = mockk<Hasher>(relaxed = true)

        val sut =
            SignInService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                sessionCreator = sessionCreator,
                sessionDeleter = sessionDeleter,
                hasher = hasher,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        val command =
            SignInUseCase.Command(
                login = "user",
                password = "password",
            )

        test("should throw NotFoundException if contest is not found") {
            every { contestRepository.findById(any()) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should throw UnauthorizedException if member is not found without contest") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(any()) } returns contest
            every { memberRepository.findByLoginAndContestIsNull(any()) } returns null
            ExecutionContext.start()

            shouldThrow<UnauthorizedException> {
                sut.execute(command)
            }
        }

        test("should throw UnauthorizedException if member is not found with contest") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(any()) } returns contest
            every { memberRepository.findByLoginAndContestId(any(), any()) } returns null

            shouldThrow<UnauthorizedException> {
                sut.execute(command)
            }
        }

        test("should throw UnauthorizedException if password is incorrect") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build()
            every { contestRepository.findById(any()) } returns contest
            every { memberRepository.findByLoginAndContestIsNull(any()) } returns member
            every { hasher.verify(any(), any()) } returns false

            shouldThrow<UnauthorizedException> {
                sut.execute(command)
            }
        }

        test("should create session successfully") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build(contest = contest)
            val session = SessionMockBuilder.build(member = member)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByLoginAndContestIdOrContestIsNull(command.login, contextContestId) } returns member
            every { hasher.verify(any(), any()) } returns true
            every { sessionCreator.create(any()) } returns session

            val result = sut.execute(command)

            result shouldBe session.toResponseBodyDTO()
            verify { hasher.verify(command.password, member.password) }
            verify { sessionDeleter.deleteAllByMember(member) }
            verify { sessionCreator.create(member) }
        }
    })
