package io.leonfoliveira.judge.core.service.contest

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.model.Attachment
import io.leonfoliveira.judge.core.domain.model.DownloadAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTOMockFactory
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import jakarta.validation.Validation
import java.time.LocalDateTime

class CreateContestServiceTest : FunSpec({
    val contestRepository: ContestRepository = mockk<ContestRepository>()
    val hashAdapter: HashAdapter = mockk<HashAdapter>()
    val bucketAdapter: BucketAdapter = mockk<BucketAdapter>()

    val validator = Validation.buildDefaultValidatorFactory().validator

    val sut =
        CreateContestService(
            contestRepository = contestRepository,
            hashAdapter = hashAdapter,
            bucketAdapter = bucketAdapter,
        )

    val now = LocalDateTime.now()

    every { bucketAdapter.createDownloadAttachment(any()) }
        .returns(DownloadAttachment("url", "key"))

    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() } returns now
    }

    context("create") {
        listOf(
            CreateContestInputDTOMockFactory.build(
                members = listOf(CreateContestInputDTOMockFactory.buildMemberDTO(type = Member.Type.ROOT)),
            ),
            CreateContestInputDTOMockFactory.build(
                members = listOf(CreateContestInputDTOMockFactory.buildMemberDTO(name = "")),
            ),
            CreateContestInputDTOMockFactory.build(
                members = listOf(CreateContestInputDTOMockFactory.buildMemberDTO(login = "")),
            ),
            CreateContestInputDTOMockFactory.build(
                members = listOf(CreateContestInputDTOMockFactory.buildMemberDTO(password = "")),
            ),
            CreateContestInputDTOMockFactory.build(
                problems = listOf(CreateContestInputDTOMockFactory.buildProblemDTO(title = "")),
            ),
            CreateContestInputDTOMockFactory.build(
                problems = listOf(CreateContestInputDTOMockFactory.buildProblemDTO(description = "")),
            ),
            CreateContestInputDTOMockFactory.build(
                problems = listOf(CreateContestInputDTOMockFactory.buildProblemDTO(timeLimit = 0)),
            ),
            CreateContestInputDTOMockFactory.build(
                problems =
                    listOf(
                        CreateContestInputDTOMockFactory.buildProblemDTO(
                            testCases =
                                Attachment(
                                    filename = "",
                                    key = "key",
                                ),
                        ),
                    ),
            ),
            CreateContestInputDTOMockFactory.build(
                problems =
                    listOf(
                        CreateContestInputDTOMockFactory.buildProblemDTO(
                            testCases =
                                Attachment(
                                    filename = "test_case_1.csv",
                                    key = "",
                                ),
                        ),
                    ),
            ),
            CreateContestInputDTOMockFactory.build(title = ""),
            CreateContestInputDTOMockFactory.build(
                languages = listOf(),
            ),
            CreateContestInputDTOMockFactory.build(
                startAt = now.plusDays(1),
                endAt = now.plusDays(1),
            ),
        ).forEach { dto ->
            test("should validate inputDTO") {
                validator.validate(dto).size shouldNotBe 0
            }
        }

        test("should create a contest") {
            val startAt = now.plusDays(1)
            val endAt = startAt.plusDays(1)
            val input =
                CreateContestInputDTOMockFactory.build(
                    startAt = startAt,
                    endAt = endAt,
                )
            every { contestRepository.save(any()) }
                .returnsArgument(0)
            every { hashAdapter.hash(any()) }
                .returns("hashed_password")
            val downloadAttachment =
                DownloadAttachment(
                    filename = "abc",
                    url = "https://example.com/key",
                )
            every { bucketAdapter.createDownloadAttachment(any()) }
                .returns(downloadAttachment)

            val result = sut.create(input)

            result.title shouldBe input.title
            result.languages shouldBe input.languages
            result.startAt shouldBe startAt
            result.endAt shouldBe endAt
            result.members[0].name shouldBe input.members[0].name
            result.members[0].login shouldBe input.members[0].login
            result.members[0].type shouldBe input.members[0].type
            result.problems[0].title shouldBe input.problems[0].title
            result.problems[0].description shouldBe input.problems[0].description
            result.problems[0].timeLimit shouldBe input.problems[0].timeLimit
            result.problems[0].testCases shouldBe downloadAttachment
        }
    }
})
