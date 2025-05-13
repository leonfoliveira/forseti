package io.leonfoliveira.judge.core.service.contest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.entity.Contest
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.verify
import java.time.LocalDateTime
import java.util.Optional

class DeleteContestServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()

    val sut = DeleteContestService(contestRepository)

    val now = LocalDateTime.now().minusYears(1)

    beforeTest {
        mockkObject(TimeUtils)
        every { TimeUtils.now() }.returns(now)
    }

    context("delete") {
        test("should throw NotFoundException when contest not found") {
            every { contestRepository.findById(any()) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.delete(1)
            }
        }

        test("should delete contest") {
            val contest = mockk<Contest>(relaxed = true)
            every { contestRepository.findById(any()) }
                .returns(Optional.of(contest))
            every { contestRepository.save(any()) }
                .returns(contest)

            sut.delete(1)

            verify { contest.deletedAt = now }
        }
    }
})
