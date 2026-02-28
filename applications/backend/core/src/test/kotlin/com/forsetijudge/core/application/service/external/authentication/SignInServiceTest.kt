package com.forsetijudge.core.application.service.external.authentication

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
import com.forsetijudge.core.port.driving.usecase.internal.session.CreateSessionInternalUseCase
import com.forsetijudge.core.port.driving.usecase.internal.session.DeleteAllSessionsByMemberInternalUseCase
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
        val createSessionInternalUseCase = mockk<CreateSessionInternalUseCase>(relaxed = true)
        val deleteAllSessionsByMemberInternalUseCase = mockk<DeleteAllSessionsByMemberInternalUseCase>(relaxed = true)
        val hasher = mockk<Hasher>(relaxed = true)

        val sut =
            SignInService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                createSessionInternalUseCase = createSessionInternalUseCase,
                deleteAllSessionsByMemberInternalUseCase = deleteAllSessionsByMemberInternalUseCase,
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
            every { createSessionInternalUseCase.execute(any()) } returns session

            val result = sut.execute(command)

            result shouldBe session
            verify { hasher.verify(command.password, member.password) }
            verify { deleteAllSessionsByMemberInternalUseCase.execute(DeleteAllSessionsByMemberInternalUseCase.Command(member)) }
            verify { createSessionInternalUseCase.execute(CreateSessionInternalUseCase.Command(member)) }
        }
    })
