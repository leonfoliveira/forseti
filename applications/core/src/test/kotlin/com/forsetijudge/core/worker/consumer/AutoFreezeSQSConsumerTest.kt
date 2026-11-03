package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.port.input.usecase.contest.AutoFreezeContestUseCase
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import software.amazon.awssdk.services.sqs.SqsClient
import tools.jackson.module.kotlin.jacksonObjectMapper

class AutoFreezeSQSConsumerTest {
    private val sqsClient = mock<SqsClient>()
    private val autoFreezeContestUseCase = mock<AutoFreezeContestUseCase>()
    private val objectMapper = jacksonObjectMapper()
    private val consumer = AutoFreezeSQSConsumer(sqsClient, "auto-freeze-queue", autoFreezeContestUseCase, objectMapper)

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
