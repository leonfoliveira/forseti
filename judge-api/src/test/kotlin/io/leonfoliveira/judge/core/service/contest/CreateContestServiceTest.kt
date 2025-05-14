package io.leonfoliveira.judge.core.service.contest

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.model.Attachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTOMockFactory
import io.mockk.every
import io.mockk.mockk
import java.time.LocalDateTime

class CreateContestServiceTest : FunSpec({
    val contestRepository: ContestRepository = mockk<ContestRepository>()
    val hashAdapter: HashAdapter = mockk<HashAdapter>()
    val bucketAdapter: BucketAdapter = mockk<BucketAdapter>()

    val sut =
        CreateContestService(
            contestRepository = contestRepository,
            hashAdapter = hashAdapter,
            bucketAdapter = bucketAdapter,
        )

    context("create") {
        test("should create a contest") {
            val startAt = LocalDateTime.now()
            val endAt = startAt.plusDays(1)
            val input = CreateContestInputDTOMockFactory.build()
            every { contestRepository.save(any()) }
                .returnsArgument(0)
            every { hashAdapter.hash(any()) }
                .returns("hashed_password")
            val attachment =
                Attachment(
                    filename = "test_case_1.java",
                    key = "123456",
                )
            every { bucketAdapter.upload(any()) }
                .returns(attachment)

            val result = sut.create(input)

            result.title shouldBe input.title
            result.languages shouldBe input.languages
            result.startAt shouldBe startAt
            result.endAt shouldBe endAt
            result.members[0].name shouldBe input.members[0].name
            result.members[0].login shouldBe input.members[0].login
            result.members[0].password shouldBe "hashed_password"
            result.members[0].type shouldBe input.members[0].type
            result.problems[0].title shouldBe input.problems[0].title
            result.problems[0].description shouldBe input.problems[0].description
            result.problems[0].timeLimit shouldBe input.problems[0].timeLimit
            result.problems[0].testCases shouldBe attachment
        }
    }
})
