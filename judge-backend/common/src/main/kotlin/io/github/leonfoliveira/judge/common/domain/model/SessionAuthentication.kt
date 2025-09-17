package io.github.leonfoliveira.judge.common.domain.model

import io.github.leonfoliveira.judge.common.domain.entity.Session
import io.github.leonfoliveira.judge.common.util.SkipCoverage
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority

@SkipCoverage
class SessionAuthentication(
    private var principal: Session? = null,
) : Authentication {
    override fun getName(): String? = null

    override fun getAuthorities(): MutableCollection<out GrantedAuthority>? = null

    override fun getCredentials(): Any? = null

    override fun getDetails(): Any? = null

    override fun getPrincipal(): Session? = principal

    override fun isAuthenticated(): Boolean = principal != null

    override fun setAuthenticated(isAuthenticated: Boolean) {
        this.isAuthenticated = isAuthenticated
    }
}
