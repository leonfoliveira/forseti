package io.github.leonfoliveira.judge.worker.docker

import io.github.leonfoliveira.judge.common.domain.entity.Contest
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ProblemMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.port.AttachmentBucketAdapter
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.repository.SubmissionRepository
import io.github.leonfoliveira.judge.common.testcontainer.LocalStackTestContainer
import io.github.leonfoliveira.judge.common.testcontainer.PostgresTestContainer
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest
@Import(PostgresTestContainer::class, LocalStackTestContainer::class)
class DockerSubmissionRunnerAdapterTest(
    val sut: DockerSubmissionRunnerAdapter,
    val contestRepository: ContestRepository,
    val attachmentBucketAdapter: AttachmentBucketAdapter,
    val submissionRepository: SubmissionRepository,
) : FunSpec({
        extensions(SpringExtension)

        beforeEach {
            clearAllMocks()
        }

        val contest = ContestMockBuilder.build()
        contest.problems = listOf(ProblemMockBuilder.build(contest = contest, timeLimit = 500, memoryLimit = 128))
        contest.members = listOf(MemberMockBuilder.build(contest = contest))
        contestRepository.save(contest)

        fun createSubmission(contest: Contest): Submission {
            val submission =
                SubmissionMockBuilder.build(
                    language = Language.PYTHON_3_13_3,
                    problem = contest.problems.first(),
                    member = contest.members.first(),
                )
            return submissionRepository.save(submission)
        }

        val testCases =
            """
            1,2
            2,4
            """.trimIndent()
        attachmentBucketAdapter.upload(contest.problems.first().testCases, testCases.toByteArray())

        context("Python 3.13.3") {
            listOf(
                Pair("print(int(input()))", Submission.Answer.WRONG_ANSWER),
                Pair("while True:\n    pass", Submission.Answer.TIME_LIMIT_EXCEEDED),
                Pair("a = 'x' * (10**9)", Submission.Answer.MEMORY_LIMIT_EXCEEDED),
                Pair("raise Exception()", Submission.Answer.RUNTIME_ERROR),
                Pair("print(2 * int(input()))", Submission.Answer.ACCEPTED),
            ).forEach { (code, expectedAnswer) ->
                test("should run a submission with Python 3.13.3 and return $expectedAnswer") {
                    val submission = createSubmission(contest)
                    attachmentBucketAdapter.upload(submission.code, code.toByteArray())
                    sut.run(submission).answer shouldBe expectedAnswer
                }
            }
        }
    })
