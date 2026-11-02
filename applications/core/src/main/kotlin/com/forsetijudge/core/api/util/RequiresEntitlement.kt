package com.forsetijudge.core.api.util

import com.forsetijudge.core.domain.model.Entitlement
import org.springframework.security.access.prepost.PreAuthorize

/**
 * Restricts access to members holding the given [Entitlement]. Paths without it are public or only require authentication.
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
@PreAuthorize("hasAuthority('{value}')")
annotation class RequiresEntitlement(
    val value: Entitlement,
)
