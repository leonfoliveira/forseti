package io.github.leonfoliveira.judge.api.security

import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.util.GeneratedSkipCoverage
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority

@GeneratedSkipCoverage
class JwtAuthentication(
    private var principal: Authorization? = null,
) : Authentication {
    override fun getName(): String? = null

    override fun getAuthorities(): MutableCollection<out GrantedAuthority>? = null

    override fun getCredentials(): Any? = null

    override fun getDetails(): Any? = null

    override fun getPrincipal(): Authorization? = principal

    override fun isAuthenticated(): Boolean = principal != null

    override fun setAuthenticated(isAuthenticated: Boolean) {
        this.isAuthenticated = isAuthenticated
    }
}
