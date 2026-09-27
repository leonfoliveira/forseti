package com.forsetijudge.core.port.input.usecase.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.JudgeDashboardResponseBodyDTO
import java.util.UUID

interface BuildJudgeDashboardUseCase {
    /**
     * Builds the judge dashboard by aggregating various metrics and information relevant to judges.
     *
     * @param command The command containing the necessary parameters to build the judge dashboard.
     *
     * @return An JudgeDashboardResultDTO containing the aggregated data for the judge dashboard.
     */
    fun execute(command: Command): JudgeDashboardResponseBodyDTO

    /**
     * Command for building the judge dashboard.
     *
     * @param contestId The ID of the contest for which the judge dashboard is being built.
     */
    data class Command(
        val contestId: UUID,
    )
}
