package io.leonfoliveira.judge.api.config

import io.leonfoliveira.judge.core.entity.model.Authorization
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority

class JwtAuthentication(
    private var principal: Authorization? = null,
    private var isAuthenticated: Boolean = false,
) : Authentication {
    override fun getName(): String? = null

    override fun getAuthorities(): MutableCollection<out GrantedAuthority>? = null

    override fun getCredentials(): Any? = null

    override fun getDetails(): Any? = null

    override fun getPrincipal(): Authorization? = this.principal

    override fun isAuthenticated(): Boolean = this.isAuthenticated

    override fun setAuthenticated(isAuthenticated: Boolean) {
        this.isAuthenticated = isAuthenticated
    }
}
