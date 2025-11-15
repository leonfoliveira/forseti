package io.github.leonfoliveira.forseti.api.application.listener

import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.port.driven.HashAdapter
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.mock.entity.MemberMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class ApplicationReadyEventListenerTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val hashAdapter = mockk<HashAdapter>(relaxed = true)
        val rootPassword = "root-password"

        val sut =
            ApplicationReadyEventApiListener(
                memberRepository = memberRepository,
                hashAdapter = hashAdapter,
                rootPassword = rootPassword,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should update system members") {
            every { hashAdapter.hash(rootPassword) } returns "hashed-root-password"
            val rootMember = MemberMockBuilder.build(type = Member.Type.ROOT)
            every { memberRepository.findByLogin("root") } returns rootMember
            every { memberRepository.save(any()) } returnsArgument 0

            sut.updateRootPassword()

            rootMember.password shouldBe "hashed-root-password"
            verify { memberRepository.save(rootMember) }
        }
    })
