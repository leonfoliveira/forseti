package com.forsetijudge.api.adapter.dto.request

data class NoLoginAuthenticateRequestDTO(
    val password: String,
) {
    override fun toString(): String = "NoLoginAuthenticationRequestDTO(password='******')"
}
