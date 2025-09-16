package io.github.leonfoliveira.judge.common.domain.entity.aud

import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import io.github.leonfoliveira.judge.common.util.SessionUtil
import org.hibernate.envers.RevisionListener

class SessionRevisionListener : RevisionListener {
    override fun newRevision(revisionEntity: Any) {
        val sessionRevisionEntity = revisionEntity as SessionRevisionEntity

        sessionRevisionEntity.sessionId = SessionUtil.getCurrent()?.id

        sessionRevisionEntity.ip = RequestContext.getCurrent().ip
        sessionRevisionEntity.traceId = RequestContext.getCurrent().traceId
    }
}
