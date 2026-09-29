package com.forsetijudge.core.domain.model

import java.util.UUID
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority

class SessionAuthentication(
    val session: Session,
    val ip: String,
) : Authentication {
    override fun getAuthorities(): Collection<GrantedAuthority> = listOf(SimpleGrantedAuthority("ROLE_${session.memberType}"))

    override fun getCredentials(): Any? = null

    override fun getDetails(): Any? = null

    override fun getPrincipal(): UUID = session.memberId

    override fun isAuthenticated(): Boolean = true

    override fun setAuthenticated(isAuthenticated: Boolean): Unit =
        throw UnsupportedOperationException("SessionAuthentication is always authenticated")

    override fun getName(): String = session.memberName
}
