package com.forsetijudge.core.port.driving.usecase.external.leaderboard

import com.forsetijudge.core.domain.model.Leaderboard
import java.util.UUID

interface BuildLeaderboardCellUseCase {
    /**
     * Builds a cell for the leaderboard based on the given contest, problem, and submissions.
     *
     * @param command The command containing the contest, problem, and submissions to build the cell for.
     * @return A pair containing the built leaderboard cell and the ID of the member for whom the cell was built.
     */
    fun execute(command: Command): Pair<Leaderboard.Cell, UUID>

    /**
     * Command for building a leaderboard cell.
     *
     * @param memberId The ID of the member for whom the cell is being built.
     * @param problemId The ID of the problem for which the cell is being built.
     */
    data class Command(
        val memberId: UUID,
        val problemId: UUID,
    )
}
