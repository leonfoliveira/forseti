package com.forsetijudge.core.port.driving.usecase.external.dashboard

import com.forsetijudge.core.domain.model.dashboard.JudgeDashboard

interface BuildJudgeDashboardUseCase {
    /**
     * Builds the judge dashboard by aggregating various metrics and information relevant to judges.
     *
     * @return An JudgeDashboardResultDTO containing the aggregated data for the judge dashboard.
     */
    fun execute(): JudgeDashboard
}
