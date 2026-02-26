package com.forsetijudge.core.domain.entity.aud

import com.forsetijudge.core.domain.model.ExecutionContext
import org.hibernate.envers.RevisionListener

class SessionRevisionListener : RevisionListener {
    /**
     * Fill the revision entity with session information from the current request context.
     *
     * @param revisionEntity The revision entity to be populated.
     */
    override fun newRevision(revisionEntity: Any) {
        val sessionRevisionEntity = revisionEntity as SessionRevisionEntity

        val context = ExecutionContext.get()

        sessionRevisionEntity.sessionId = context.session?.id
        sessionRevisionEntity.ip = context.ip
        sessionRevisionEntity.traceId = context.traceId
    }
}
