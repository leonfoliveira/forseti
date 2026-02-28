package com.forsetijudge.core.application.service.external.authentication

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.cryptography.Hasher
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.driving.usecase.internal.session.CreateSessionInternalUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify

class AuthenticateSystemServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>()
        val findSessionByIdUseCase = mockk<FindSessionByIdUseCase>()
        val createSessionInternalUseCase = mockk<CreateSessionInternalUseCase>()
        val hasher = mockk<Hasher>()

        val sut =
            AuthenticateSystemService(
                memberRepository = memberRepository,
                findSessionByIdUseCase = findSessionByIdUseCase,
                createSessionInternalUseCase = createSessionInternalUseCase,
                hasher = hasher,
            )

        beforeEach {
            clearAllMocks()
            ExecutionContext.clear()
            every { hasher.hash(any()) } returns "hashed_password"
            every { memberRepository.save(any()) } returnsArgument 0
        }

        test("should throw ForbiddenException for invalid member type") {
            val command =
                AuthenticateSystemUseCase.Command(
                    login = "system_user",
                    type = Member.Type.CONTESTANT,
                )

            shouldThrow<ForbiddenException> { sut.execute(command) }
        }

        val command =
            AuthenticateSystemUseCase.Command(
                login = "system_user",
                type = Member.Type.API,
            )

        test("should authenticate new member") {
            val expectedSession = SessionMockBuilder.build()
            every { memberRepository.findByLoginAndContestIsNull(command.login) } returns null
            every { createSessionInternalUseCase.execute(any()) } returns expectedSession

            sut.execute(command)

            val session = ExecutionContext.getSession()
            session shouldBe expectedSession
            val newMemberSlot = slot<Member>()
            verify { memberRepository.save(capture(newMemberSlot)) }
            val newMember = newMemberSlot.captured
            newMember.name shouldBe command.login
            newMember.login shouldBe command.login
            newMember.type shouldBe command.type
            newMember.password shouldBe "hashed_password"
        }

        test("should authenticate existing member") {
            val existingMember = MemberMockBuilder.build()
            val expectedSession = SessionMockBuilder.build(member = existingMember)
            every { memberRepository.findByLoginAndContestIsNull(command.login) } returns existingMember
            every { createSessionInternalUseCase.execute(any()) } returns expectedSession

            sut.execute(command)

            val session = ExecutionContext.getSession()
            session shouldBe expectedSession
            session.member shouldBe existingMember
            verify { memberRepository.save(existingMember) }
        }

        test("should use cached session if valid") {
            val existingMember = MemberMockBuilder.build()
            val cachedSession = SessionMockBuilder.build(member = existingMember)
            val secondSession = SessionMockBuilder.build(member = existingMember)
            every { memberRepository.findByLoginAndContestIsNull(command.login) } returns existingMember
            every { createSessionInternalUseCase.execute(any()) } returnsMany listOf(cachedSession, secondSession)
            every { findSessionByIdUseCase.execute(any()) } returns cachedSession

            sut.execute(command)
            sut.execute(command)

            val session = ExecutionContext.getSession()
            session shouldBe cachedSession
            session.member shouldBe existingMember
            verify(exactly = 1) { createSessionInternalUseCase.execute(any()) }
        }

        test("should create new session if cached session is invalid") {
            val existingMember = MemberMockBuilder.build()
            val cachedSession = SessionMockBuilder.build(member = existingMember)
            val secondSession = SessionMockBuilder.build(member = existingMember)
            every { memberRepository.findByLoginAndContestIsNull(command.login) } returns existingMember
            every { createSessionInternalUseCase.execute(any()) } returnsMany listOf(cachedSession, secondSession)
            every { findSessionByIdUseCase.execute(any()) } throws UnauthorizedException()

            sut.execute(command)
            sut.execute(command)

            val session = ExecutionContext.getSession()
            session shouldBe secondSession
            session.member shouldBe existingMember
            verify { createSessionInternalUseCase.execute(any()) }
        }
    })
