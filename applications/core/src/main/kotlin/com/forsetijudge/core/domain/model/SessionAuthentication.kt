package com.forsetijudge.core.domain.model

import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority

class SessionAuthentication(
    val session: SessionResponseBodyDTO,
    val ip: String,
) : Authentication {
    override fun getAuthorities(): Collection<GrantedAuthority> = listOf(SimpleGrantedAuthority("ROLE_${session.member.type}"))

    override fun getCredentials(): Any? = null

    override fun getDetails(): Any? = null

    override fun getPrincipal(): Any = session.member

    override fun isAuthenticated(): Boolean = true

    override fun setAuthenticated(isAuthenticated: Boolean): Unit =
        throw UnsupportedOperationException("SessionAuthentication is always authenticated")

    override fun getName(): String = session.member.name
}
