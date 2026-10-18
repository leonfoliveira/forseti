package com.forsetijudge.core.port.input.usecase.dashboard

import com.forsetijudge.core.port.dto.response.dashboard.StaffDashboardResponseDTO
import java.util.UUID

interface BuildStaffDashboardUseCase {
    /**
     * Builds the staff dashboard by aggregating various metrics and information relevant to staffs.
     *
     * @param command The command containing the necessary parameters to build the staff dashboard.
     *
     * @return An StaffDashboardResponseDTO containing the aggregated data for the staff dashboard.
     */
    fun execute(command: Command): StaffDashboardResponseDTO

    /**
     * Command for building the staff dashboard.
     *
     * @param contestId The ID of the contest for which the staff dashboard is being built.
     */
    data class Command(
        val contestId: UUID,
    )
}
