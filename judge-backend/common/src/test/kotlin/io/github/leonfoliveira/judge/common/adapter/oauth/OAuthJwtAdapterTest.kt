package io.github.leonfoliveira.judge.common.adapter.oauth

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.mock.MemberMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockkStatic
import java.time.OffsetDateTime

class OAuthJwtAdapterTest : FunSpec({
    val secret = "test-secret"
    val expiration = "1h"
    val rootExpiration = "30m"

    val sut = OAuthJwtAdapter(
        secret = secret,
        expiration = expiration,
        rootExpiration = rootExpiration
    )

    val now = OffsetDateTime.now()

    beforeEach {
        mockkStatic(OffsetDateTime::class)
        every { OffsetDateTime.now() } returns now
    }

    test("should generate authorization for root member") {
        val member = MemberMockBuilder.build(type = Member.Type.ROOT, contest = null)

        val authorization = sut.generateAuthorization(member)

        authorization.member.id shouldBe member.id
        authorization.member.contestId shouldBe null
        authorization.member.name shouldBe member.name
        authorization.member.type shouldBe Member.Type.ROOT
        authorization.accessToken shouldNotBe null
        authorization.expiresAt shouldBe now.plusMinutes(30)
    }

    test("should generate authorization for regular member") {
        val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

        val authorization = sut.generateAuthorization(member)

        authorization.member.id shouldBe member.id
        authorization.member.contestId shouldBe member.contest?.id
        authorization.member.name shouldBe member.name
        authorization.member.type shouldBe member.type
        authorization.accessToken shouldNotBe null
        authorization.expiresAt shouldBe now.plusHours(1)
    }

    test("should decode authorization member from token") {
        val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
        val authorization = sut.generateAuthorization(member)

        val decodedMember = sut.decodeToken(authorization.accessToken)

        decodedMember.id shouldBe member.id
        decodedMember.contestId shouldBe member.contest?.id
        decodedMember.name shouldBe member.name
        decodedMember.type shouldBe member.type
    }
})
