package com.forsetijudge.core.service.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.JudgeDashboardResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.dashboard.BuildJudgeDashboardUseCase

class BuildJudgeDashboardService : BuildJudgeDashboardUseCase {
    /**
     * Builds the judge dashboard by aggregating various metrics and information relevant to judges.
     *
     * @param command The command containing the necessary parameters to build the judge dashboard.
     *
     * @return An JudgeDashboardResultDTO containing the aggregated data for the judge dashboard.
     */
    override fun execute(command: BuildJudgeDashboardUseCase.Command): JudgeDashboardResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
