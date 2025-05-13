package io.leonfoliveira.judge.core.service.contest

import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.entity.Member
import io.leonfoliveira.judge.core.entity.model.Attachment
import io.leonfoliveira.judge.core.entity.model.RawAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTO
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
            val input =
                CreateContestInputDTO(
                    title = "Test Contest",
                    languages = listOf(),
                    startAt = startAt,
                    endAt = endAt,
                    members =
                        listOf(
                            CreateContestInputDTO.MemberDTO(
                                type = Member.Type.CONTESTANT,
                                name = "Contestant Name",
                                login = "contestant_login",
                                password = "contestant_password",
                            ),
                        ),
                    problems =
                        listOf(
                            CreateContestInputDTO.ProblemDTO(
                                title = "Problem 1",
                                description = "Problem 1 description",
                                timeLimit = 1000,
                                languages = listOf(),
                                testCases =
                                    RawAttachment(
                                        filename = "test_case_1.java",
                                        content = "test_case_1_content".encodeToByteArray(),
                                    ),
                            ),
                        ),
                )
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

            assert(result.title == input.title)
            assert(result.languages == input.languages)
            assert(result.startAt == input.startAt)
            assert(result.endAt == input.endAt)
            assert(result.members.size == input.members.size)
            assert(result.members[0].type == input.members[0].type)
            assert(result.members[0].name == input.members[0].name)
            assert(result.members[0].login == input.members[0].login)
            assert(result.members[0].password == "hashed_password")
            assert(result.problems.size == input.problems.size)
            assert(result.problems[0].title == input.problems[0].title)
            assert(result.problems[0].description == input.problems[0].description)
            assert(result.problems[0].timeLimit == input.problems[0].timeLimit)
            assert(result.problems[0].testCases == attachment)
        }
    }
})
