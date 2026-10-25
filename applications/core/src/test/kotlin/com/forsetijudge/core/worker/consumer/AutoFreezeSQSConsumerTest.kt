package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.port.input.usecase.contest.AutoFreezeContestUseCase
import com.forsetijudge.core.testcontainer.TestContainerLocalStack
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import tools.jackson.module.kotlin.jacksonObjectMapper

class AutoFreezeSQSConsumerTest : TestContainerLocalStack() {
    private val queueName = "auto-freeze-queue"
    private val queueUrl = sqsAsyncClient.createQueue { it.queueName(queueName) }.get().queueUrl()
    private val autoFreezeContestUseCase = mock<AutoFreezeContestUseCase>()
    private val objectMapper = jacksonObjectMapper()
    private val consumer = AutoFreezeSQSConsumer(sqsClient, queueUrl, autoFreezeContestUseCase, objectMapper)

    @Test
    fun `should call freezeContestUseCase when listen is called with valid body`() {
        val contestId = java.util.UUID.randomUUID()
        val body = AutoFreezeSQSConsumer.Body(contestId)

        consumer.handle(objectMapper.writeValueAsString(body))

        verify(autoFreezeContestUseCase).execute(
            AutoFreezeContestUseCase.Command(
                contestId = contestId,
            ),
        )
    }
}
