package com.forsetijudge.core.port.input.usecase.printrequest

import com.forsetijudge.core.port.dto.response.printrequest.PrintRequestResponseDTO
import java.util.UUID

interface CreatePrintRequestUseCase {
    /**
     * Creates a new print request for the specified submission in the given contest.
     *
     * @param command The command containing the contest ID and submission ID.
     * @return A [PrintRequestResponseDTO] representing the created print request.
     */
    fun execute(command: Command): PrintRequestResponseDTO

    /**
     * Command class representing the input parameters for creating a print request.
     *
     * @property contestId The ID of the contest for which the print request is being created.
     * @property submissionId The ID of the submission for which the print request is being created.
     */
    data class Command(
        val contestId: UUID,
        val submissionId: UUID,
    )
}
