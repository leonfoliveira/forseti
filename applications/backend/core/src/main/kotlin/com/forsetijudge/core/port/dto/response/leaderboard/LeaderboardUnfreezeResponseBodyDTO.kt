package com.forsetijudge.core.port.dto.response.leaderboard

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.dto.response.submission.SubmissionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import java.io.Serializable

data class LeaderboardUnfreezeResponseBodyDTO(
    val leaderboard: LeaderboardResponseBodyDTO,
    val frozenSubmissions: List<SubmissionResponseBodyDTO>,
) : Serializable

fun Leaderboard.toUnfreezeResponseBodyDTO(frozenSubmissions: List<Submission>): LeaderboardUnfreezeResponseBodyDTO =
    LeaderboardUnfreezeResponseBodyDTO(
        leaderboard = this.toResponseBodyDTO(),
        frozenSubmissions = frozenSubmissions.map { it.toResponseBodyDTO() },
    )
