package com.forsetijudge.core.port.input.usecase.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.ContestantDashboardResponseBodyDTO

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
     * @param commandId The ID of the command to build the contestant dashboard.
     */
    data class Command(
        val commandId: Long,
    )
}
