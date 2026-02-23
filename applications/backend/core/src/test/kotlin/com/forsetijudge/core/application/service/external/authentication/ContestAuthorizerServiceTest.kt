package com.forsetijudge.core.application.service.external.authentication

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.authentication.ContestAuthorizerUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk

class ContestAuthorizerServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)

        val sut =
            ContestAuthorizerService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        val command =
            ContestAuthorizerUseCase.Command(
                chain = { contestAuthorizer ->
                    // No-op for testing
                },
            )

        test("should throw NotFoundException when contest is not found") {
            every { contestRepository.findById(contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw NotFoundException when member is not found") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should execute chain when contest and member is found") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

            var chainExecuted = false
            val testCommand =
                command.copy(
                    chain = { contestAuthorizer ->
                        chainExecuted = true
                    },
                )

            sut.execute(testCommand)

            chainExecuted shouldBe true
        }

        test("should execute chain when contest and member is null") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest

            var chainExecuted = false
            val testCommand =
                command.copy(
                    chain = { contestAuthorizer ->
                        chainExecuted = true
                    },
                )

            sut.execute(testCommand)

            chainExecuted shouldBe true
        }
    })
