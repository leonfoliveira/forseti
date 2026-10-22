package com.forsetijudge.core.api.http.dto.request.printrequest

import com.forsetijudge.core.domain.entity.PrintRequest

data class UpdateStatusPrintRequestRequestBodyDTO(
    val status: PrintRequest.Status,
)
