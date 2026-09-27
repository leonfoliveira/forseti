package com.forsetijudge.core.port.input.usecase.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.AdminDashboardResponseBodyDTO
import java.util.UUID

interface BuildAdminDashboardUseCase {
    /**
     * Builds the admin dashboard by aggregating various metrics and information relevant to administrators.
     *
     * @param command The command containing the necessary parameters to build the admin dashboard.
     *
     * @return An AdminDashboardResultDTO containing the aggregated data for the admin dashboard.
     */
    fun execute(command: Command): AdminDashboardResponseBodyDTO

    /**
     * Command for building the admin dashboard.
     *
     * @param contestId The unique identifier of the contest for which the admin dashboard is being built.
     */
    data class Command(
        val contestId: UUID,
    )
}
