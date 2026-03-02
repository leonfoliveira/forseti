package com.forsetijudge.core.port.driving.usecase.external.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.StaffDashboardResponseBodyDTO

interface BuildStaffDashboardUseCase {
    /**
     * Builds the staff dashboard by aggregating various metrics and information relevant to staffs.
     *
     * @return An StaffDashboardResultDTO containing the aggregated data for the staff dashboard.
     */
    fun execute(): StaffDashboardResponseBodyDTO
}
