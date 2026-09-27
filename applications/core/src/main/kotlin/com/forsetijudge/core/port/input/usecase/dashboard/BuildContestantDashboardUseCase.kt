package com.forsetijudge.core.port.input.usecase.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.ContestantDashboardResponseBodyDTO
import java.util.UUID

interface BuildContestantDashboardUseCase {
    /**
     * Builds the contestant dashboard by aggregating various metrics and information relevant to contestants.
     *
     * @param command The command containing the necessary parameters to build the contestant dashboard.
     *
     * @return An ContestantDashboardResultDTO containing the aggregated data for the contestant dashboard.
     */
    fun execute(command: Command): ContestantDashboardResponseBodyDTO

    /**
     * Command for building the contestant dashboard.
     *
     * @param contestId The ID of the contest for which the dashboard is being built.
     */
    data class Command(
        val contestId: UUID,
    )
}
