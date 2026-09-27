package com.forsetijudge.core.api.http.dto.request.authentication

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class AuthenticateRootRequestBodyDTO(
    val password: String,
)
