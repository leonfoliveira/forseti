package com.forsetijudge.core.port.input.usecase.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.AdminDashboardResponseBodyDTO

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
     * @param commandId The ID of the command to build the admin dashboard.
     */
    data class Command(
        val commandId: Long,
    )
}
