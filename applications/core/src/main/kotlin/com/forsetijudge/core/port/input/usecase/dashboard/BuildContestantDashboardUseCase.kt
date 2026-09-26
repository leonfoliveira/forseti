package com.forsetijudge.core.port.input.usecase.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.ContestantDashboardResponseBodyDTO

interface BuildContestantDashboardUseCase {
    /**
     * Builds the contestant dashboard by aggregating various metrics and information relevant to contestants.
     *
     * @return An ContestantDashboardResultDTO containing the aggregated data for the contestant dashboard.
     */
    fun execute(): ContestantDashboardResponseBodyDTO
}
