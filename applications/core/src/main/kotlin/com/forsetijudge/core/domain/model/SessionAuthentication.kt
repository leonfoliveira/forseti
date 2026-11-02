package com.forsetijudge.core.domain.model

import com.forsetijudge.core.domain.model.Entitlement
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import java.util.UUID

class SessionAuthentication(
    val session: Session,
    val ip: String,
) : Authentication {
    override fun getAuthorities(): Collection<GrantedAuthority> =
        Entitlement.forType(session.member.type).map {
            SimpleGrantedAuthority(it.name)
        }

    override fun getCredentials(): Any? = null

    override fun getDetails(): Any? = null

    override fun getPrincipal(): UUID = session.member.id

    override fun isAuthenticated(): Boolean = true

    override fun setAuthenticated(isAuthenticated: Boolean): Unit =
        throw UnsupportedOperationException("SessionAuthentication is always authenticated")

    override fun getName(): String = session.member.name
}
