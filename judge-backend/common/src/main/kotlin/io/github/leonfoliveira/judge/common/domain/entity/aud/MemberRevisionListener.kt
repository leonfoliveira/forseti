package io.github.leonfoliveira.judge.common.domain.entity.aud

import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import io.github.leonfoliveira.judge.common.util.SessionUtil
import org.hibernate.envers.RevisionListener

class MemberRevisionListener : RevisionListener {
    override fun newRevision(revisionEntity: Any) {
        val memberRevisionEntity = revisionEntity as MemberRevisionEntity

        memberRevisionEntity.sessionId = SessionUtil.getCurrent()?.id

        memberRevisionEntity.ip = RequestContext.getCurrent().ip
        memberRevisionEntity.traceId = RequestContext.getCurrent().traceId
    }
}
