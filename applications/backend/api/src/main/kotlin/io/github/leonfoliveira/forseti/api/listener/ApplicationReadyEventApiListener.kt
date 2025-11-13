package io.github.leonfoliveira.forseti.api.listener

import io.github.leonfoliveira.forseti.common.domain.entity.Member
import io.github.leonfoliveira.forseti.common.port.HashAdapter
import io.github.leonfoliveira.forseti.common.repository.MemberRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class ApplicationReadyEventApiListener(
    private val memberRepository: MemberRepository,
    private val hashAdapter: HashAdapter,
    @Value("\${security.root.password}")
    private val rootPassword: String,
) {
    /**
     * Updates the root user's password when the application is ready.
     */
    @EventListener(ApplicationReadyEvent::class)
    fun updateRootPassword() {
        val root =
            memberRepository.findByLogin(Member.ROOT_LOGIN)!!.apply {
                password = hashAdapter.hash(rootPassword)
            }
        memberRepository.save(root)
    }
}
