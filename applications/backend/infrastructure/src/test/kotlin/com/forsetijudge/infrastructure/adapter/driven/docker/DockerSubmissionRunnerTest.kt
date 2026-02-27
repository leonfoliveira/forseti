package com.forsetijudge.infrastructure.adapter.driven.docker

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.port.driven.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.testcontainer.TestContainers
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest
@Import(TestContainers::class)
class DockerSubmissionRunnerTest(
    val sut: DockerSubmissionRunner,
    val contestRepository: ContestRepository,
    val submissionRepository: SubmissionRepository,
    val attachmentBucket: AttachmentBucket,
) : FunSpec({
        extensions(SpringExtension)

        lateinit var contest: Contest

        beforeSpec {
            contest = ContestMockBuilder.build()
            contest = contestRepository.save(contest)

            val member = MemberMockBuilder.build(contest = contest)
            contest.members = listOf(member)
            contest = contestRepository.save(contest)

            val descriptionAttachment =
                AttachmentMockBuilder.build(
                    contest = contest,
                    member = contest.members.first(),
                    context = Attachment.Context.PROBLEM_DESCRIPTION,
                )
            val testCasesAttachment =
                AttachmentMockBuilder.build(
                    contest = contest,
                    member = contest.members.first(),
                    context = Attachment.Context.PROBLEM_TEST_CASES,
                )
            val problem =
                ProblemMockBuilder.build(
                    contest = contest,
                    timeLimit = 500,
                    memoryLimit = 128,
                    description = descriptionAttachment,
                    testCases = testCasesAttachment,
                )
            val testCases =
                """
                1,2
                2,4
                """.trimIndent()
            attachmentBucket.upload(testCasesAttachment, testCases.toByteArray())
            contest.problems = listOf(problem)
            contest = contestRepository.save(contest)
        }

        beforeEach {
            clearAllMocks()
        }

        fun createSubmission(
            contest: Contest,
            language: Submission.Language,
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
                            contest = contest,
                            member = contest.members.first(),
                            filename = filename,
                            contentType = contentType,
                            context = Attachment.Context.SUBMISSION_CODE,
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
                    val submission = createSubmission(contest, Submission.Language.CPP_17, filename, "text/plain")
                    val code = importCode("/code/cpp17/$filename")
                    attachmentBucket.upload(submission.code, code.toByteArray())
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
                    val submission = createSubmission(contest, Submission.Language.JAVA_21, filename, "text/plain")
                    val code = importCode("/code/java21/$filename")
                    attachmentBucket.upload(submission.code, code.toByteArray())
                    sut.run(submission).answer shouldBe expectedAnswer
                }
            }
        }

        context("Python 3.12") {
            listOf(
                Pair("accepted.py", Submission.Answer.ACCEPTED),
                Pair("memory_limit_exceeded.py", Submission.Answer.MEMORY_LIMIT_EXCEEDED),
                Pair("runtime_error.py", Submission.Answer.RUNTIME_ERROR),
                Pair("time_limit_exceeded.py", Submission.Answer.TIME_LIMIT_EXCEEDED),
                Pair("wrong_answer.py", Submission.Answer.WRONG_ANSWER),
            ).forEach { (filename, expectedAnswer) ->
                test("should run a submission with Python 3.12 and return $expectedAnswer") {
                    val submission = createSubmission(contest, Submission.Language.PYTHON_312, filename, "text/plain")
                    val code = importCode("/code/python312/$filename")
                    attachmentBucket.upload(submission.code, code.toByteArray())
                    sut.run(submission).answer shouldBe expectedAnswer
                }
            }
        }
    })
