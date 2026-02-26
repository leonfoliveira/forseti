package com.forsetijudge.core.application.service.external.submission

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.submission.FindAllSubmissionsByContestSinceLastFreezeUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class FindAllSubmissionsByContestSinceLastFreezeServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)

        val sut =
            FindAllSubmissionsByContestSinceLastFreezeService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                submissionRepository = submissionRepository,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId = contextContestId, memberId = contextMemberId)
        }

        val command =
            FindAllSubmissionsByContestSinceLastFreezeUseCase.Command(
                frozenAt = OffsetDateTime.now().minusHours(1),
            )

        test("should throw NotFoundException if contest does not exist") {
            every { contestRepository.findById(contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw NotFoundException if member does not exist in contest") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw ForbiddenException if member cannot access not started contest") {
            val contest =
                ContestMockBuilder.build(
                    startAt = OffsetDateTime.now().plusHours(1),
                )
            every { contestRepository.findById(any()) } returns contest
            val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
            every { memberRepository.findByIdAndContestIdOrContestIsNull(any(), any()) } returns member

            shouldThrow<BusinessException> { sut.execute(command) }
        }

        test("should return submissions since last freeze") {
            val contest = ContestMockBuilder.build(frozenAt = OffsetDateTime.now().minusHours(1))
            every { contestRepository.findById(any()) } returns contest
            val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
            val submissions =
                listOf(
                    SubmissionMockBuilder.build(),
                    SubmissionMockBuilder.build(),
                )
            every { submissionRepository.findByContestIdAndCreatedAtGreaterThanEqual(contest.id, command.frozenAt) } returns submissions

            val result = sut.execute(command)

            result shouldBe submissions
        }
    })
