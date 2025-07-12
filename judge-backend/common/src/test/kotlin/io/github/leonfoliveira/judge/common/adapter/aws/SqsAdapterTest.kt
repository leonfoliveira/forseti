package io.github.leonfoliveira.judge.common.adapter.aws

import io.github.leonfoliveira.judge.common.testcontainer.LocalStackTestContainer
import io.kotest.core.spec.style.FunSpec
import io.kotest.core.test.TestCase
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [SqsAdapter::class, AwsConfig::class])
class SqsAdapterTest(
    val sut: SqsAdapter,
) : FunSpec() {
    companion object {
        val localstack = LocalStackTestContainer().start()
    }

    init {
        extensions(SpringExtension)

        test("should enqueue a message to SQS") {
            val queue = localstack.submissionQueue
            val payload = "Test message"

            sut.enqueue(queue, payload)

            val result = localstack.container.execInContainer("awslocal", "sqs", "receive-message", "--queue-url", queue)
            val messages = result.stdout.lines().filter { it.contains(payload) }
            messages.isNotEmpty() shouldBe true
        }
    }
}
