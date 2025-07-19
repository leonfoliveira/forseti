package io.github.leonfoliveira.judge.common.adapter.aws

import io.github.leonfoliveira.judge.common.testcontainer.LocalStackTestContainer
import io.github.leonfoliveira.judge.common.testcontainer.PostgresTestContainer
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.testcontainers.containers.localstack.LocalStackContainer

@ActiveProfiles("test")
@SpringBootTest
@Import(LocalStackTestContainer::class, PostgresTestContainer::class)
class SqsAdapterTest(
    val sut: SqsAdapter,
    val localStackContainer: LocalStackContainer,
) : FunSpec({
        extensions(SpringExtension)

        test("should enqueue a message to SQS") {
            val queue = LocalStackTestContainer.SUBMISSION_QUEUE
            val payload = "Test message"

            sut.enqueue(queue, payload)

            val result = localStackContainer.execInContainer("awslocal", "sqs", "receive-message", "--queue-url", queue)
            val messages = result.stdout.lines().filter { it.contains(payload) }
            messages.isNotEmpty() shouldBe true
        }
    })
