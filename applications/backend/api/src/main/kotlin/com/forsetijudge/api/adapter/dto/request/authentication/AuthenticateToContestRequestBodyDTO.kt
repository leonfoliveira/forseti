package com.forsetijudge.api.adapter.dto.request.authentication

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class AuthenticateToContestRequestBodyDTO(
    val login: String,
    val password: String,
)
