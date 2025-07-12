package io.github.leonfoliveira.judge.worker.docker

import com.opencsv.CSVReader
import io.github.leonfoliveira.judge.common.adapter.aws.AwsConfig
import io.github.leonfoliveira.judge.common.adapter.aws.S3Adapter
import io.github.leonfoliveira.judge.common.adapter.aws.adapter.S3AttachmentBucketAdapter
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.mock.entity.ProblemMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.testcontainer.LocalStackTestContainer
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import java.io.ByteArrayInputStream
import java.io.InputStreamReader
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [DockerSubmissionRunnerAdapter::class, S3AttachmentBucketAdapter::class, S3Adapter::class, AwsConfig::class, DockerSubmissionRunnerConfigFactory::class, AllConfigs::class, S3Adapter::class])
class DockerSubmissionRunnerAdapterTest(
    val sut: DockerSubmissionRunnerAdapter,
    val s3Adapter: S3Adapter,
) : FunSpec() {
    companion object {
        val localstack = LocalStackTestContainer().start()
    }

    init {
        extensions(SpringExtension)

        beforeEach {
            clearAllMocks()
        }

        val problem = ProblemMockBuilder.build(timeLimit = 1000, memoryLimit = 128)
        val testCases = """
            1,2
            2,4
        """.trimIndent()
        val test = CSVReader(InputStreamReader(ByteArrayInputStream(testCases.toByteArray()))).use {
            reader -> reader.readAll()
        }
        println("test cases: ")
        test.forEach {
            println(it.joinToString(", "))
        }
        s3Adapter.upload(localstack.bucketName, problem.testCases.id.toString(), testCases.toByteArray())

        context("Python 3.13.3") {
            listOf(
                Pair("print(int(input()))", Submission.Answer.WRONG_ANSWER),
                Pair("while True:\n    pass", Submission.Answer.TIME_LIMIT_EXCEEDED),
                Pair("a = 'x' * (10**9)", Submission.Answer.MEMORY_LIMIT_EXCEEDED),
                Pair("raise Exception()", Submission.Answer.RUNTIME_ERROR),
                Pair("print(2 * int(input()))", Submission.Answer.ACCEPTED),
            ).forEach { (code, expectedAnswer) ->
                val submission = SubmissionMockBuilder.build(language = Language.PYTHON_3_13_3, problem = problem)

                test("should run a submission with Python 3.13.3 and return $expectedAnswer") {
                    s3Adapter.upload(localstack.bucketName, submission.code.id.toString(), code.toByteArray())
                    sut.run(submission) shouldBe expectedAnswer
                }
            }
        }
    }
}

@Configuration
@ComponentScan("io.github.leonfoliveira.judge.worker.docker.config")
class AllConfigs
