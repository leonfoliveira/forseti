package com.forsetijudge.core.domain.entity.aud

import com.forsetijudge.core.domain.model.SessionAuthentication
import org.hibernate.envers.RevisionListener
import org.slf4j.MDC
import org.springframework.security.core.context.SecurityContextHolder

class SessionRevisionListener : RevisionListener {
    /**
     * Fill the revision entity with session information from the current request context.
     *
     * @param revisionEntity The revision entity to be populated.
     */
    override fun newRevision(revisionEntity: Any) {
        val sessionRevisionEntity = revisionEntity as SessionRevisionEntity

        val authentication = SecurityContextHolder.getContext().authentication as? SessionAuthentication

        sessionRevisionEntity.memberId = authentication?.principal
        sessionRevisionEntity.ip = authentication?.ip
        sessionRevisionEntity.traceId = MDC.get("traceId")
    }
}
