package com.forsetijudge.api.adapter.dto.request.authentication

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class AuthenticateRootRequestBodyDTO(
    val password: String,
)
