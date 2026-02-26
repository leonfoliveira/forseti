package com.forsetijudge.core.port.driving.usecase.external.dashboard

import com.forsetijudge.core.domain.model.dashboard.GuestDashboard

interface BuildGuestDashboardUseCase {
    /**
     * Builds the guest dashboard by aggregating various metrics and information relevant to guests.
     *
     * @return An GuestDashboardResultDTO containing the aggregated data for the guest dashboard.
     */
    fun execute(): GuestDashboard
}
