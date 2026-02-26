package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.session.CreateSessionUseCase
import com.forsetijudge.core.port.driving.usecase.internal.session.CreateSessionInternalUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk

class CreateSessionServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val createSessionInternalUseCase = mockk<CreateSessionInternalUseCase>(relaxed = true)

        val sut =
            CreateSessionService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                createSessionInternalUseCase = createSessionInternalUseCase,
            )

        val command =
            CreateSessionUseCase.Command(
                memberId = java.util.UUID.randomUUID(),
                contestId = java.util.UUID.randomUUID(),
            )

        test("should throw NotFoundException when contest is not found") {
            every { contestRepository.findById(command.contestId!!) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should throw NotFoundException when member is not found") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(command.contestId!!) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(command.memberId, contest.id) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should throw NotFoundException when member is not found without contest") {
            every { memberRepository.findByIdAndContestIsNull(command.memberId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command.copy(contestId = null))
            }
        }

        test("should create session successfully") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build()
            val session = SessionMockBuilder.build()

            every { contestRepository.findById(command.contestId!!) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(command.memberId, contest.id) } returns member
            every { createSessionInternalUseCase.execute(any()) } returns session

            val result = sut.execute(command)

            result shouldBe session
        }

        test("should create session successfully without contest") {
            val member = MemberMockBuilder.build()
            val session = SessionMockBuilder.build()

            every { memberRepository.findByIdAndContestIsNull(command.memberId) } returns member
            every { createSessionInternalUseCase.execute(any()) } returns session

            val result = sut.execute(command.copy(contestId = null))

            result shouldBe session
        }
    })
