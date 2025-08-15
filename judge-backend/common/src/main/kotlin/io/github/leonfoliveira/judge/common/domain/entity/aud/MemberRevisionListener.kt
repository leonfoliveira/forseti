package io.github.leonfoliveira.judge.common.domain.entity.aud

import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import org.hibernate.envers.RevisionListener
import org.slf4j.MDC
import org.springframework.security.core.context.SecurityContextHolder

class MemberRevisionListener : RevisionListener {
    override fun newRevision(revisionEntity: Any) {
        val memberRevisionEntity = revisionEntity as MemberRevisionEntity
        SecurityContextHolder.getContext()?.authentication?.let {
            val authorization = it.principal as Authorization
            memberRevisionEntity.memberId = authorization.member.id
            memberRevisionEntity.traceId = MDC.get("traceId")
        }
    }
}
