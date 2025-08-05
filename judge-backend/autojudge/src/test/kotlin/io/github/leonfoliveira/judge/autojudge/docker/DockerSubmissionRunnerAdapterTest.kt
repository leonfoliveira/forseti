package io.github.leonfoliveira.judge.autojudge.docker

import io.github.leonfoliveira.judge.common.domain.entity.Attachment
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

        fun createSubmission(
            contest: Contest,
            language: Language,
            filename: String,
            contentType: String,
        ): Submission {
            val submission =
                SubmissionMockBuilder.build(
                    language = language,
                    problem = contest.problems.first(),
                    member = contest.members.first(),
                    code =
                        Attachment(
                            filename = filename,
                            contentType = contentType,
                        ),
                )
            return submissionRepository.save(submission)
        }

        fun importCode(path: String): String {
            val resource = javaClass.getResource(path)
            if (resource == null) {
                throw IllegalArgumentException("File not found: $path")
            }
            return resource.readText()
        }

        val testCases =
            """
            1,2
            2,4
            """.trimIndent()
        attachmentBucketAdapter.upload(contest.problems.first().testCases, testCases.toByteArray())

        context("C++ 17") {
            listOf(
                Pair("accepted.cpp", Submission.Answer.ACCEPTED),
                Pair("compilation_error.cpp", Submission.Answer.COMPILATION_ERROR),
                Pair("memory_limit_exceeded.cpp", Submission.Answer.MEMORY_LIMIT_EXCEEDED),
                Pair("runtime_error.cpp", Submission.Answer.RUNTIME_ERROR),
                Pair("time_limit_exceeded.cpp", Submission.Answer.TIME_LIMIT_EXCEEDED),
                Pair("wrong_answer.cpp", Submission.Answer.WRONG_ANSWER),
            ).forEach { (filename, expectedAnswer) ->
                test("should run a submission with C++ 17 and return $expectedAnswer") {
                    val submission = createSubmission(contest, Language.CPP_17, filename, "text/plain")
                    val code = importCode("/code/cpp17/$filename")
                    attachmentBucketAdapter.upload(submission.code, code.toByteArray())
                    sut.run(submission).answer shouldBe expectedAnswer
                }
            }
        }

        context("Java 21") {
            listOf(
                Pair("Accepted.java", Submission.Answer.ACCEPTED),
                Pair("CompilationError.java", Submission.Answer.COMPILATION_ERROR),
                Pair("MemoryLimitExceeded.java", Submission.Answer.MEMORY_LIMIT_EXCEEDED),
                Pair("RuntimeError.java", Submission.Answer.RUNTIME_ERROR),
                Pair("TimeLimitExceeded.java", Submission.Answer.TIME_LIMIT_EXCEEDED),
                Pair("WrongAnswer.java", Submission.Answer.WRONG_ANSWER),
            ).forEach { (filename, expectedAnswer) ->
                test("should run a submission with Java 21 and return $expectedAnswer") {
                    val submission = createSubmission(contest, Language.JAVA_21, filename, "text/plain")
                    val code = importCode("/code/java21/$filename")
                    attachmentBucketAdapter.upload(submission.code, code.toByteArray())
                    sut.run(submission).answer shouldBe expectedAnswer
                }
            }
        }

        context("Python 3.13") {
            listOf(
                Pair("accepted.py", Submission.Answer.ACCEPTED),
                Pair("memory_limit_exceeded.py", Submission.Answer.MEMORY_LIMIT_EXCEEDED),
                Pair("runtime_error.py", Submission.Answer.RUNTIME_ERROR),
                Pair("time_limit_exceeded.py", Submission.Answer.TIME_LIMIT_EXCEEDED),
                Pair("wrong_answer.py", Submission.Answer.WRONG_ANSWER),
            ).forEach { (filename, expectedAnswer) ->
                test("should run a submission with Python 3.13 and return $expectedAnswer") {
                    val submission = createSubmission(contest, Language.PYTHON_3_13, filename, "text/plain")
                    val code = importCode("/code/python3_13/$filename")
                    attachmentBucketAdapter.upload(submission.code, code.toByteArray())
                    sut.run(submission).answer shouldBe expectedAnswer
                }
            }
        }
    })
