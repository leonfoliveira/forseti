package com.forsetijudge.core.port.driving.usecase.external.dashboard

import com.forsetijudge.core.domain.model.dashboard.ContestantDashboard

interface BuildContestantDashboardUseCase {
    /**
     * Builds the contestant dashboard by aggregating various metrics and information relevant to contestants.
     *
     * @return An ContestantDashboardResultDTO containing the aggregated data for the contestant dashboard.
     */
    fun execute(): ContestantDashboard
}
