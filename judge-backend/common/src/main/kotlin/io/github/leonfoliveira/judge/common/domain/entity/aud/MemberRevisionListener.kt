package io.github.leonfoliveira.judge.common.domain.entity.aud

import io.github.leonfoliveira.judge.common.util.SessionUtil
import org.hibernate.envers.RevisionListener
import org.slf4j.MDC

class MemberRevisionListener : RevisionListener {
    override fun newRevision(revisionEntity: Any) {
        val memberRevisionEntity = revisionEntity as MemberRevisionEntity
        val session = SessionUtil.getCurrent()
        memberRevisionEntity.sessionId = session?.id
        memberRevisionEntity.traceId = MDC.get("traceId")
    }
}
