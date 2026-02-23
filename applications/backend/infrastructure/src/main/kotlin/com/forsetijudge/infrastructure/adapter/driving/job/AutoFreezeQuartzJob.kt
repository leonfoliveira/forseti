package com.forsetijudge.infrastructure.adapter.driving.job

import com.forsetijudge.core.port.driven.scheduler.payload.AutoFreezeJobPayload
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.FreezeLeaderboardUseCase
import org.springframework.stereotype.Component

@Component
class AutoFreezeQuartzJob(
    private val freezeLeaderboardUseCase: FreezeLeaderboardUseCase,
) : QuartzJob<AutoFreezeJobPayload>() {
    override fun getPayloadType(): Class<AutoFreezeJobPayload> = AutoFreezeJobPayload::class.java

    /**
     * Handles the payload for the ContestFreezeJob by calling the freeze method of the FreezeLeaderboardUseCase with the contestId from the payload.
     *
     * @param payload The payload containing the contestId for which the leaderboard should be frozen.
     */
    override fun handlePayload(payload: AutoFreezeJobPayload) {
        logger.info("Handling ContestFreezeJob for contest with id {}", payload.contestId)

        freezeLeaderboardUseCase.execute()

        logger.info("Finished handling ContestFreezeJob")
    }
}
