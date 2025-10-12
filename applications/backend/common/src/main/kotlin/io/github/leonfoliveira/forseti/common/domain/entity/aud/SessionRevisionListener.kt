package io.github.leonfoliveira.forseti.common.domain.entity.aud

import io.github.leonfoliveira.forseti.common.domain.model.RequestContext
import org.hibernate.envers.RevisionListener

class SessionRevisionListener : RevisionListener {
    override fun newRevision(revisionEntity: Any) {
        val sessionRevisionEntity = revisionEntity as SessionRevisionEntity

        val context = RequestContext.getContext()

        sessionRevisionEntity.sessionId = context.session?.id
        sessionRevisionEntity.ip = context.ip
        sessionRevisionEntity.traceId = context.traceId
    }
}
