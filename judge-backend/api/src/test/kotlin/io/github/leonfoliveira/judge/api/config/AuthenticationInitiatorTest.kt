package io.github.leonfoliveira.judge.api.config

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify

class AuthenticationInitiatorTest : FunSpec({
    val memberRepository = mockk<MemberRepository>(relaxed = true)
    val hashAdapter = mockk<HashAdapter>(relaxed = true)
    val rootPassword = "root-password"

    val sut =
        AuthenticationInitiator(
            memberRepository = memberRepository,
            hashAdapter = hashAdapter,
            rootPassword = rootPassword,
        )

    beforeEach {
        clearAllMocks()
    }

    test("should create system members") {
        every { hashAdapter.hash(any()) } returns "hashed-password"
        every { hashAdapter.hash(rootPassword) } returns "hashed-root-password"
        every { memberRepository.findByLogin(any()) } returns null

        sut.createOrUpdateSystemMembers()

        val membersSlot = slot<List<Member>>()
        verify { memberRepository.saveAll(capture(membersSlot)) }
        membersSlot.captured.size shouldBe 2
        membersSlot.captured[0].apply {
            id.toString() shouldBe "00000000-0000-0000-0000-000000000000"
            type shouldBe Member.Type.ROOT
            name shouldBe "root"
            login shouldBe "root"
            password shouldBe "hashed-root-password"
        }
        membersSlot.captured[1].apply {
            id.toString() shouldBe "11111111-1111-1111-1111-111111111111"
            type shouldBe Member.Type.AUTOJUDGE
            name shouldBe "autojudge"
            login shouldBe "autojudge"
            password shouldBe "hashed-password"
        }
    }

    test("should update system members") {
        every { hashAdapter.hash(any()) } returns "hashed-password"
        every { hashAdapter.hash(rootPassword) } returns "hashed-root-password"
        val rootMember = MemberMockBuilder.build(type = Member.Type.ROOT)
        val autoJudgeMember = MemberMockBuilder.build(type = Member.Type.AUTOJUDGE)
        every { memberRepository.findByLogin("root") } returns rootMember
        every { memberRepository.findByLogin("autojudge") } returns autoJudgeMember

        sut.createOrUpdateSystemMembers()

        rootMember.password shouldBe "hashed-root-password"
        autoJudgeMember.password shouldBe "hashed-password"
        verify { memberRepository.saveAll(listOf(rootMember, autoJudgeMember)) }
    }
})
