package com.forsetijudge.core.application.helper.submission

import com.forsetijudge.core.application.helper.IdGenerator
import com.forsetijudge.core.application.helper.submission.SubmissionFinder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class SubmissionFinderTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)

        val sut =
            SubmissionFinder(
                submissionRepository = submissionRepository,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId = contextContestId, memberId = contextMemberId)
        }

        test("should return submissions since last freeze") {
            val contest = ContestMockBuilder.build()
            val frozenAt = OffsetDateTime.now().minusDays(1)
            val submissions =
                listOf(
                    SubmissionMockBuilder.build(),
                    SubmissionMockBuilder.build(),
                )
            every {
                submissionRepository.findByContestIdAndCreatedAtGreaterThanEqual(
                    contest.id,
                    frozenAt,
                )
            } returns submissions

            val result =
                sut.findAllByContestSinceLastFreeze(
                    contest = contest,
                    frozenAt = frozenAt,
                )

            result shouldBe submissions
        }
    })
