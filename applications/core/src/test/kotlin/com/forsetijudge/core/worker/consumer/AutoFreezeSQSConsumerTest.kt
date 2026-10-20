package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.port.input.usecase.contest.AutoFreezeContestUseCase
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify

class AutoFreezeSQSConsumerTest {
    private val autoFreezeContestUseCase = mock<AutoFreezeContestUseCase>()
    private val consumer = AutoFreezeSQSConsumer(autoFreezeContestUseCase)

    @Test
    fun `should call freezeContestUseCase when listen is called with valid body`() {
        val contestId = java.util.UUID.randomUUID()
        val body = AutoFreezeSQSConsumer.Body(contestId)

        consumer.listen(body)

        verify(autoFreezeContestUseCase).execute(
            AutoFreezeContestUseCase.Command(
                contestId = contestId,
            ),
        )
    }
}
