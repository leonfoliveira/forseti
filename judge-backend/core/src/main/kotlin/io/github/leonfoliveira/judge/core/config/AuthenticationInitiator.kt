package io.github.leonfoliveira.judge.core.config

import io.github.leonfoliveira.judge.core.domain.entity.Member
import io.github.leonfoliveira.judge.core.port.HashAdapter
import io.github.leonfoliveira.judge.core.repository.MemberRepository
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
    @Value("\${security.auto-judge.password}")
    private val autoJudgePassword: String,
) {
    @EventListener(ApplicationReadyEvent::class)
    fun onApplicationReady() {
        val root =
            memberRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000000"))
                .orElse(
                    Member(
                        type = Member.Type.ROOT,
                        name = "root",
                        login = "root",
                        password = hashAdapter.hash(rootPassword),
                    ),
                )

        val autoJudge =
            memberRepository.findById(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .orElse(
                    Member(
                        type = Member.Type.AUTO_JURY,
                        name = "auto-jury",
                        login = "auto-jury",
                        password = hashAdapter.hash(autoJudgePassword),
                    ),
                )

        memberRepository.saveAll(listOf(root, autoJudge))
    }
}
