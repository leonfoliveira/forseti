package io.leonfoliveira.judge.core.service.contest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.domain.model.DownloadAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.output.toOutputDTO
import io.mockk.every
import io.mockk.mockk
import java.util.Optional

class FindContestServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()
    val bucketAdapter = mockk<BucketAdapter>()

    val sut = FindContestService(contestRepository, bucketAdapter)

    every { bucketAdapter.createDownloadAttachment(any()) }
        .returns(DownloadAttachment("url", "key"))

    context("findAll") {
        test("should return all contests") {
            val contests = listOf(ContestMockFactory.build(), ContestMockFactory.build())
            every { contestRepository.findAll() }
                .returns(contests)

            val result = sut.findAll()

            result shouldBe contests.map { it.toOutputDTO(bucketAdapter) }
        }
    }

    context("findById") {
        test("should throw NotFoundException when contest not found") {
            val id = 1
            every { contestRepository.findById(id) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.findById(id)
            }
        }

        test("should return contest") {
            val id = 1
            val contest = ContestMockFactory.build()
            every { contestRepository.findById(id) }
                .returns(Optional.of(contest))

            val result = sut.findById(id)

            result shouldBe contest.toOutputDTO(bucketAdapter)
        }
    }
})
