package io.github.leonfoliveira.judge.api.config

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import java.util.UUID
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Profile
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class AuthenticationInitiator(
    private val memberRepository: MemberRepository,
    private val hashAdapter: HashAdapter,
    @Value("\${security.root.password}")
    private val rootPassword: String,
) {
    @EventListener(ApplicationReadyEvent::class)
    fun onApplicationReady() {
        val root =
            memberRepository.findByLogin("root")
                ?: Member(
                    id = UUID.fromString("00000000-0000-0000-0000-000000000000"),
                    type = Member.Type.ROOT,
                    name = "root",
                    login = "root",
                    password = hashAdapter.hash(rootPassword),
                )

        val autoJudge =
            memberRepository.findByLogin("auto-jury")
                ?: Member(
                    id = UUID.fromString("11111111-1111-1111-1111-111111111111"),
                    type = Member.Type.AUTO_JURY,
                    name = "auto-jury",
                    login = "auto-jury",
                    password = hashAdapter.hash(UUID.randomUUID().toString()),
                )

        memberRepository.saveAll(listOf(root, autoJudge))
    }
}