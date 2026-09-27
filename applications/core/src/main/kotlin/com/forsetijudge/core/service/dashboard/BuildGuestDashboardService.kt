package com.forsetijudge.core.service.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.GuestDashboardResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.dashboard.BuildGuestDashboardUseCase

class BuildGuestDashboardService : BuildGuestDashboardUseCase {
    /**
     * Builds the guest dashboard by aggregating various metrics and information relevant to guests.
     *
     * @param command The command containing the necessary parameters to build the guest dashboard.
     *
     * @return An GuestDashboardResultDTO containing the aggregated data for the guest dashboard.
     */
    override fun execute(command: BuildGuestDashboardUseCase.Command): GuestDashboardResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
