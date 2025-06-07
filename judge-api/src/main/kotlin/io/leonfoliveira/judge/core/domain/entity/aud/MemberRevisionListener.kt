package io.leonfoliveira.judge.core.domain.entity.aud

import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import org.hibernate.envers.RevisionListener
import org.slf4j.MDC
import org.springframework.security.core.context.SecurityContextHolder

class MemberRevisionListener : RevisionListener {
    override fun newRevision(revisionEntity: Any) {
        val memberRevisionEntity = revisionEntity as MemberRevisionEntity
        SecurityContextHolder.getContext()?.authentication?.let {
            val authorization = it.principal as AuthorizationMember
            memberRevisionEntity.memberId = authorization.id
            memberRevisionEntity.traceId = MDC.get("traceId")
        }
    }
}
