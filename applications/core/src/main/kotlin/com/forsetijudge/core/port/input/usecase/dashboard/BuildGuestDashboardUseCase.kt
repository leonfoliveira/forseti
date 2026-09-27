package com.forsetijudge.core.port.input.usecase.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.GuestDashboardResponseBodyDTO
import java.util.UUID

interface BuildGuestDashboardUseCase {
    /**
     * Builds the guest dashboard by aggregating various metrics and information relevant to guests.
     *
     * @param command The command containing the necessary parameters to build the guest dashboard.
     *
     * @return An GuestDashboardResultDTO containing the aggregated data for the guest dashboard.
     */
    fun execute(command: Command): GuestDashboardResponseBodyDTO

    /**
     * Command for building the guest dashboard.
     *
     * @param contestId The unique identifier of the contest for which the guest dashboard is being built.
     */
    data class Command(
        val contestId: UUID,
    )
}
