package com.forsetijudge.api.adapter.driving.job

import com.forsetijudge.core.application.util.IdUtil
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.leaderboard.FreezeLeaderboardUseCase
import com.forsetijudge.infrastructure.adapter.driving.job.AutoFreezeQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.job.payload.AutoFreezeJobPayload
import io.kotest.core.spec.style.FunSpec
import io.mockk.mockk
import io.mockk.verify

class ContestAutoFreezeJobTest :
    FunSpec({
        val freezeLeaderboardUseCase = mockk<FreezeLeaderboardUseCase>(relaxed = true)

        val sut = AutoFreezeQuartzJob(freezeLeaderboardUseCase)

        test("should call freezeLeaderboardUseCase") {
            val payload =
                AutoFreezeJobPayload(
                    contestId = IdUtil.getUUIDv7(),
                )

            sut.handlePayload(payload)

            verify {
                freezeLeaderboardUseCase.freeze(payload.contestId, Member.API_ID)
            }
        }
    })
