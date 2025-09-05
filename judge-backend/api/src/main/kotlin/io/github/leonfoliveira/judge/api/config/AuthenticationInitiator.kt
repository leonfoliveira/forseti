package io.github.leonfoliveira.judge.api.config

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class AuthenticationInitiator(
    private val memberRepository: MemberRepository,
    private val hashAdapter: HashAdapter,
    @Value("\${security.root.password}")
    private val rootPassword: String,
) {
    @EventListener(ApplicationReadyEvent::class)
    fun createOrUpdateSystemMembers() {
        val root =
            memberRepository.findByLogin(Member.ROOT_LOGIN)?.apply {
                password = hashAdapter.hash(rootPassword)
            }
                ?: Member(
                    id = UUID.fromString(Member.ROOT_ID),
                    type = Member.Type.ROOT,
                    name = Member.ROOT_NAME,
                    login = Member.ROOT_LOGIN,
                    password = hashAdapter.hash(rootPassword),
                )

        val autoJudge =
            memberRepository.findByLogin(Member.AUTOJUDGE_LOGIN)?.apply {
                password = hashAdapter.hash(UUID.randomUUID().toString())
            }
                ?: Member(
                    id = UUID.fromString(Member.AUTOJUDGE_ID),
                    type = Member.Type.AUTOJUDGE,
                    name = Member.AUTOJUDGE_NAME,
                    login = Member.AUTOJUDGE_LOGIN,
                    password = hashAdapter.hash(UUID.randomUUID().toString()),
                )

        memberRepository.saveAll(listOf(root, autoJudge))
    }
}
