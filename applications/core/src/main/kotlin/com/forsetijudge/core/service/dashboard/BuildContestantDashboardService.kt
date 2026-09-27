package com.forsetijudge.core.service.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.ContestantDashboardResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.dashboard.BuildContestantDashboardUseCase

class BuildContestantDashboardService : BuildContestantDashboardUseCase {
    /**
     * Builds the contestant dashboard by aggregating various metrics and information relevant to contestants.
     *
     * @param command The command containing the necessary parameters to build the contestant dashboard.
     *
     * @return An ContestantDashboardResultDTO containing the aggregated data for the contestant dashboard.
     */
    override fun execute(command: BuildContestantDashboardUseCase.Command): ContestantDashboardResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
