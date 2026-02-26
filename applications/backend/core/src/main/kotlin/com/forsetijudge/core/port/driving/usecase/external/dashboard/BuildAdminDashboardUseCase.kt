package com.forsetijudge.core.port.driving.usecase.external.dashboard

import com.forsetijudge.core.domain.model.dashboard.AdminDashboard

interface BuildAdminDashboardUseCase {
    /**
     * Builds the admin dashboard by aggregating various metrics and information relevant to administrators.
     *
     * @return An AdminDashboardResultDTO containing the aggregated data for the admin dashboard.
     */
    fun execute(): AdminDashboard
}
