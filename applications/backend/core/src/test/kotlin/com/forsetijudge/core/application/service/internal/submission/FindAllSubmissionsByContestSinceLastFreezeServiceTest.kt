package com.forsetijudge.core.application.service.internal.submission

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.internal.submission.FindAllSubmissionsByContestSinceLastFreezeInternalUseCase
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class FindAllSubmissionsByContestSinceLastFreezeServiceTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)

        val sut =
            FindAllSubmissionsByContestSinceLastFreezeInternalService(
                submissionRepository = submissionRepository,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId = contextContestId, memberId = contextMemberId)
        }

        val command =
            FindAllSubmissionsByContestSinceLastFreezeInternalUseCase.Command(
                contest = ContestMockBuilder.build(),
                frozenAt = OffsetDateTime.now().minusHours(1),
            )

        test("should return submissions since last freeze") {
            val submissions =
                listOf(
                    SubmissionMockBuilder.build(),
                    SubmissionMockBuilder.build(),
                )
            every {
                submissionRepository.findByContestIdAndCreatedAtGreaterThanEqual(
                    command.contest.id,
                    command.frozenAt,
                )
            } returns submissions

            val result = sut.execute(command)

            result shouldBe submissions
        }
    })
