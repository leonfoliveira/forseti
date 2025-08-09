package io.github.leonfoliveira.judge.common.adapter.oauth

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
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

    val sut =
        OAuthJwtAdapter(
            secret = secret,
            expiration = expiration,
            rootExpiration = rootExpiration,
        )

    val now = OffsetDateTime.now()

    beforeEach {
        mockkStatic(OffsetDateTime::class)
        every { OffsetDateTime.now() } returns now
    }

    test("should generate authorization for root member") {
        val member = MemberMockBuilder.build(type = Member.Type.ROOT, contest = null)

        val authorization = sut.buildAuthorization(member)

        authorization.member.id shouldBe member.id
        authorization.member.contestId shouldBe null
        authorization.member.name shouldBe member.name
        authorization.member.type shouldBe Member.Type.ROOT
        authorization.expiresAt shouldBe now.plusMinutes(30)
    }

    test("should generate authorization for regular member") {
        val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

        val authorization = sut.buildAuthorization(member)

        authorization.member.id shouldBe member.id
        authorization.member.contestId shouldBe member.contest?.id
        authorization.member.name shouldBe member.name
        authorization.member.type shouldBe member.type
        authorization.expiresAt shouldBe now.plusHours(1)
    }

    test("should encode authorization to token") {
        val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
        val authorization = sut.buildAuthorization(member)

        val accessToken = sut.encodeToken(authorization)

        accessToken shouldNotBe null
        accessToken.isNotEmpty() shouldBe true
    }

    test("should decode authorization from token") {
        val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
        val authorization = sut.buildAuthorization(member)
        val accessToken = sut.encodeToken(authorization)

        val decodedAuthorization = sut.decodeToken(accessToken)

        decodedAuthorization.member.id shouldBe member.id
        decodedAuthorization.member.name shouldBe member.name
        decodedAuthorization.member.type shouldBe member.type
    }
})
