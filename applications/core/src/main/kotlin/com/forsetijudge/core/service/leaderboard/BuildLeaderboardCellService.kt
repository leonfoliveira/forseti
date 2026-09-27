package com.forsetijudge.core.service.leaderboard

import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardCellResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.leaderboard.BuildLeaderboardCellUseCase

class BuildLeaderboardCellService : BuildLeaderboardCellUseCase {
    /**
     * Builds a cell for the leaderboard based on the given member and problem.
     *
     * @param command The command containing the member and problem to build the cell for.
     * @return A pair containing the built leaderboard cell and the ID of the member for whom the cell was built.
     */
    override fun execute(command: BuildLeaderboardCellUseCase.Command): LeaderboardCellResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
