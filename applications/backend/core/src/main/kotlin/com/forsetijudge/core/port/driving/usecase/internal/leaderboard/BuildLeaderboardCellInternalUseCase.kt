package com.forsetijudge.core.port.driving.usecase.internal.leaderboard

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.Leaderboard

interface BuildLeaderboardCellInternalUseCase {
    /**
     * Builds a cell for the leaderboard based on the given contest, problem, and submissions.
     *
     * @param command The command containing the contest, problem, and submissions to build the cell for.
     * @return The result of building the leaderboard cell, including the number of accepted submissions and the penalty time.
     */
    fun execute(command: Command): Leaderboard.Cell

    /**
     * Command for building a leaderboard cell.
     *
     * @param contest The contest for which the cell is being built.
     * @param problem The problem for which the cell is being built.
     * @param submissions The list of submissions for the given problem and contest.
     */
    data class Command(
        val contest: Contest,
        val problem: Problem,
        val submissions: List<Submission>,
    )
}
