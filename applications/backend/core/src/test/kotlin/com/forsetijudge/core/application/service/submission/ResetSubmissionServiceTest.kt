package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.helper.outbox.OutboxEventPublisher
import com.forsetijudge.core.application.helper.IdGenerator
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.submission.ResetSubmissionUseCase
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class ResetSubmissionServiceTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val outboxEventPublisher = mockk<OutboxEventPublisher>(relaxed = true)

        val sut =
            ResetSubmissionService(
                submissionRepository = submissionRepository,
                memberRepository = memberRepository,
                outboxEventPublisher = outboxEventPublisher,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId = contextContestId, memberId = contextMemberId)
        }

        val command =
            ResetSubmissionUseCase.Command(
                submissionId = IdGenerator.getUUID(),
            )

        test("should throw NotFoundException when submission not found") {
            every { submissionRepository.findByIdAndContestId(command.submissionId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw NotFoundException when member not found") {
            val submission = SubmissionMockBuilder.build()
            every { submissionRepository.findByIdAndContestId(command.submissionId, contextContestId) } returns submission
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw ForbiddenException when member does not belong to contest") {
            val submission = SubmissionMockBuilder.build()
            val member = MemberMockBuilder.build()
            every { submissionRepository.findByIdAndContestId(command.submissionId, contextContestId) } returns submission
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

            shouldThrow<ForbiddenException> { sut.execute(command) }
        }

        Member.Type.entries.filter { it !in setOf(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE) }.forEach { memberType ->
            test("should throw ForbiddenException when member type is $memberType") {
                val submission = SubmissionMockBuilder.build()
                val member = MemberMockBuilder.build(type = memberType, contest = submission.contest)
                every { submissionRepository.findByIdAndContestId(command.submissionId, contextContestId) } returns submission
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> { sut.execute(command) }
            }
        }

        test("should reset submission successfully") {
            val submission = SubmissionMockBuilder.build()
            val member = MemberMockBuilder.build(type = Member.Type.JUDGE, contest = submission.contest)
            every { submissionRepository.findByIdAndContestId(command.submissionId, contextContestId) } returns submission
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
            every { submissionRepository.save(any()) } returnsArgument 0

            val result = sut.execute(command)

            result shouldBe submission.toWithCodeAndExecutionResponseBodyDTO()
            submission.status shouldBe Submission.Status.JUDGING
            submission.answer shouldBe null
            verify { submissionRepository.save(submission) }
            verify {
                outboxEventPublisher.publish(
                    match { it is SubmissionEvent.Updated && it.submissionId == submission.id },
                )
            }
            verify {
                outboxEventPublisher.publish(
                    match { it is SubmissionEvent.Reset && it.submissionId == submission.id },
                )
            }
        }
    })
