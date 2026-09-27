package com.forsetijudge.core.service.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.AdminDashboardResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.dashboard.BuildAdminDashboardUseCase

class BuildAdminDashboardService : BuildAdminDashboardUseCase {
    /**
     * Builds the admin dashboard by aggregating various metrics and information relevant to administrators.
     *
     * @param command The command containing the necessary parameters to build the admin dashboard.
     *
     * @return An AdminDashboardResultDTO containing the aggregated data for the admin dashboard.
     */
    override fun execute(command: BuildAdminDashboardUseCase.Command): AdminDashboardResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
