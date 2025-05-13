package io.leonfoliveira.judge.core.service.contest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.entity.Contest
import io.leonfoliveira.judge.core.entity.Member
import io.leonfoliveira.judge.core.entity.Problem
import io.leonfoliveira.judge.core.entity.enumerate.Language
import io.leonfoliveira.judge.core.entity.model.Attachment
import io.leonfoliveira.judge.core.entity.model.RawAttachment
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTO
import io.mockk.every
import io.mockk.mockk
import java.time.LocalDateTime

class UpdateContestServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()
    val hashAdapter = mockk<HashAdapter>()
    val bucketAdapter = mockk<BucketAdapter>()
    val findContestService = mockk<FindContestService>()
    val createContestService = mockk<CreateContestService>()
    val deleteContestService = mockk<DeleteContestService>()

    val sut =
        UpdateContestService(
            contestRepository = contestRepository,
            hashAdapter = hashAdapter,
            bucketAdapter = bucketAdapter,
            findContestService = findContestService,
            createContestService = createContestService,
            deleteContestService = deleteContestService,
        )

    context("update") {
        test("should throw NotFoundException when member not found") {
            val input =
                UpdateContestInputDTO(
                    id = 1,
                    title = "Test Contest",
                    languages = listOf(),
                    startAt = LocalDateTime.now(),
                    endAt = LocalDateTime.now().plusDays(1),
                    members =
                        listOf(
                            UpdateContestInputDTO.MemberDTO(
                                id = 2,
                                type = Member.Type.CONTESTANT,
                                name = "Contestant Name",
                                login = "contestant_login",
                                password = "contestant_password",
                            ),
                        ),
                    problems = listOf(),
                )
            val contest =
                Contest(
                    id = 1,
                    title = "Test Contest",
                    languages = listOf(),
                    startAt = LocalDateTime.now(),
                    endAt = LocalDateTime.now().plusDays(1),
                    members = listOf(),
                    problems = listOf(),
                )
            every { findContestService.findById(input.id) }
                .returns(contest)

            shouldThrow<NotFoundException> {
                sut.update(input)
            }
        }

        test("should throw NotFoundException when problem not found") {
            val input =
                UpdateContestInputDTO(
                    id = 1,
                    title = "Test Contest",
                    languages = listOf(),
                    startAt = LocalDateTime.now(),
                    endAt = LocalDateTime.now().plusDays(1),
                    members = listOf(),
                    problems =
                        listOf(
                            UpdateContestInputDTO.ProblemDTO(
                                id = 2,
                                title = "Problem 1",
                                description = "Problem 1 description",
                                timeLimit = 1000,
                                testCases = null,
                            ),
                        ),
                )
            val contest =
                Contest(
                    id = 1,
                    title = "Test Contest",
                    languages = listOf(),
                    startAt = LocalDateTime.now(),
                    endAt = LocalDateTime.now().plusDays(1),
                    members = listOf(),
                    problems = listOf(),
                )
            every { findContestService.findById(input.id) }
                .returns(contest)

            shouldThrow<NotFoundException> {
                sut.update(input)
            }
        }

        test("should update contest") {
            val startAt = LocalDateTime.now()
            val endAt = startAt.plusDays(1)
            val input =
                UpdateContestInputDTO(
                    id = 1,
                    title = "New Test Contest",
                    languages = listOf(Language.PYTHON_3_13_3),
                    startAt = startAt.plusDays(10),
                    endAt = endAt.plusDays(10),
                    members =
                        listOf(
                            UpdateContestInputDTO.MemberDTO(
                                id = 1,
                                type = Member.Type.CONTESTANT,
                                name = "NEW Contestant Name 1",
                                login = "new_contestant_login_1",
                                password = "new_contestant_password_1",
                            ),
                            UpdateContestInputDTO.MemberDTO(
                                id = 2,
                                type = Member.Type.CONTESTANT,
                                name = "New Contestant Name 2",
                                login = "new_contestant_login_2",
                            ),
                            UpdateContestInputDTO.MemberDTO(
                                type = Member.Type.CONTESTANT,
                                name = "New Contestant Name 3",
                                login = "new_contestant_login_3",
                                password = "new_contestant_password_3",
                            ),
                        ),
                    problems =
                        listOf(
                            UpdateContestInputDTO.ProblemDTO(
                                id = 1,
                                title = "New Problem 1",
                                description = "New Problem 1 description",
                                timeLimit = 1001,
                                testCases =
                                    RawAttachment(
                                        filename = "new_test_case_1.java",
                                        content = "new_test_case_1_content".encodeToByteArray(),
                                    ),
                            ),
                            UpdateContestInputDTO.ProblemDTO(
                                id = 2,
                                title = "New Problem 2",
                                description = "New Problem 2 description",
                                timeLimit = 1001,
                            ),
                            UpdateContestInputDTO.ProblemDTO(
                                title = "New Problem 3",
                                description = "New Problem 3 description",
                                timeLimit = 1001,
                                testCases =
                                    RawAttachment(
                                        filename = "new_test_case_3.java",
                                        content = "new_test_case_3_content".encodeToByteArray(),
                                    ),
                            ),
                        ),
                )
            val contest =
                Contest(
                    id = 1,
                    title = "Test Contest",
                    languages = listOf(),
                    startAt = startAt,
                    endAt = endAt,
                    members = listOf(),
                    problems = listOf(),
                )
            contest.members =
                listOf(
                    Member(
                        id = 0,
                        type = Member.Type.CONTESTANT,
                        name = "Contestant Name 0",
                        login = "contestant_login_0",
                        password = "hashed_password_0",
                        contest = contest,
                    ),
                    Member(
                        id = 1,
                        type = Member.Type.CONTESTANT,
                        name = "Contestant Name 1",
                        login = "contestant_login_1",
                        password = "hashed_password_1",
                        contest = contest,
                    ),
                    Member(
                        id = 2,
                        type = Member.Type.CONTESTANT,
                        name = "Contestant Name 2",
                        login = "contestant_login_2",
                        password = "hashed_password_2",
                        contest = contest,
                    ),
                )
            contest.problems =
                listOf(
                    Problem(
                        id = 0,
                        title = "Problem 0",
                        description = "Problem 0 description",
                        timeLimit = 1000,
                        testCases =
                            Attachment(
                                filename = "test_case_0.java",
                                key = "123456",
                            ),
                        contest = contest,
                    ),
                    Problem(
                        id = 1,
                        title = "Problem 1",
                        description = "Problem 1 description",
                        timeLimit = 1000,
                        testCases =
                            Attachment(
                                filename = "test_case_1.java",
                                key = "123456",
                            ),
                        contest = contest,
                    ),
                    Problem(
                        id = 2,
                        title = "Problem 2",
                        description = "Problem 2 description",
                        timeLimit = 1000,
                        testCases =
                            Attachment(
                                filename = "test_case_2.java",
                                key = "123456",
                            ),
                        contest = contest,
                    ),
                )
            every { findContestService.findById(any()) }
                .returns(contest)
            every { createContestService.createMember(any(), any()) }
                .returns(
                    Member(
                        type = Member.Type.CONTESTANT,
                        name = "Contestant Name 0",
                        login = "contestant_login_0",
                        password = "hashed_password_0",
                        contest = contest,
                    ),
                )
            every { createContestService.createProblem(any(), any()) }
                .returns(
                    Problem(
                        title = "Problem 0",
                        description = "Problem 0 description",
                        timeLimit = 1000,
                        testCases =
                            Attachment(
                                filename = "test_case_0.java",
                                key = "123456",
                            ),
                        contest = contest,
                    ),
                )
            every { deleteContestService.deleteMembers(any()) }
                .returns(Unit)
            every { deleteContestService.deleteProblems(any()) }
                .returns(Unit)
            every { contestRepository.save(any()) }
                .returnsArgument(0)
            every { hashAdapter.hash(any()) }
                .returns("new_hashed_password")
            val attachment =
                Attachment(
                    filename = "test_case_1.java",
                    key = "123456",
                )
            every { bucketAdapter.upload(any()) }
                .returns(attachment)

            val result = sut.update(input)

            assert(result.id == input.id)
            assert(result.title == input.title)
            assert(result.languages == input.languages)
            assert(result.startAt == input.startAt)
            assert(result.endAt == input.endAt)
            assert(result.members.size == input.members.size)
            assert(result.members[0].id == input.members[0].id)
            assert(result.members[0].type == input.members[0].type)
            assert(result.members[0].name == input.members[0].name)
            assert(result.members[0].login == input.members[0].login)
            assert(result.members[0].password == "new_hashed_password")
            assert(result.members[1].id == input.members[1].id)
            assert(result.members[1].type == input.members[1].type)
            assert(result.members[1].name == input.members[1].name)
            assert(result.members[1].login == input.members[1].login)
            assert(result.members[1].password == "hashed_password_2")
            assert(result.members[2].id == 0)
            assert(result.members[2].type == input.members[2].type)
            assert(result.members[2].name == input.members[2].name)
            assert(result.members[2].login == input.members[2].login)
            assert(result.members[2].password == "new_hashed_password")
            assert(result.problems.size == input.problems.size)
            assert(result.problems[0].id == input.problems[0].id)
            assert(result.problems[0].title == input.problems[0].title)
            assert(result.problems[0].description == input.problems[0].description)
            assert(result.problems[0].timeLimit == input.problems[0].timeLimit)
            assert(result.problems[0].testCases == attachment)
            assert(result.problems[1].id == input.problems[1].id)
            assert(result.problems[1].title == input.problems[1].title)
            assert(result.problems[1].description == input.problems[1].description)
            assert(result.problems[1].timeLimit == input.problems[1].timeLimit)
            assert(result.problems[1].testCases == contest.problems[1].testCases)
            assert(result.problems[2].id == 0)
            assert(result.problems[2].title == input.problems[2].title)
            assert(result.problems[2].description == input.problems[2].description)
            assert(result.problems[2].timeLimit == input.problems[2].timeLimit)
            assert(result.problems[2].testCases == attachment)
        }
    }
})
