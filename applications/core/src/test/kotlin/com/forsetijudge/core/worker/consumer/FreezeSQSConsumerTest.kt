package com.forsetijudge.core.worker.consumer

import com.forsetijudge.core.port.input.usecase.contest.FreezeContestUseCase
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify

class FreezeSQSConsumerTest {
    private val freezeContestUseCase = mock<FreezeContestUseCase>()
    private val consumer = FreezeSQSConsumer(freezeContestUseCase)

    @Test
    fun `should call freezeContestUseCase when listen is called with valid body`() {
        val contestId = java.util.UUID.randomUUID()
        val body = FreezeSQSConsumer.Body(contestId)

        consumer.listen(body)

        verify(freezeContestUseCase).execute(
            FreezeContestUseCase.Command(
                contestId = contestId,
                bypassMemberAuthorization = true,
            ),
        )
    }
}
