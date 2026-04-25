package com.forsetijudge.core.application.helper.session

import com.forsetijudge.core.application.helper.session.SessionCreator
import com.forsetijudge.core.application.helper.session.SessionDeleter
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.cache.SessionCache
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import java.time.OffsetDateTime

class SessionCreatorTest :
    FunSpec({
        val sessionRepository = mockk<SessionRepository>(relaxed = true)
        val sessionDeleter = mockk<SessionDeleter>(relaxed = true)
        val sessionCache = mockk<SessionCache>(relaxed = true)
        val defaultExpiration = "1h"
        val rootExpiration = "1h"
        val systemExpiration = "1h"

        val sut =
            SessionCreator(
                sessionRepository = sessionRepository,
                sessionDeleter = sessionDeleter,
                sessionCache = sessionCache,
                defaultExpiration = defaultExpiration,
                rootExpiration = rootExpiration,
                systemExpiration = systemExpiration,
            )

        val now = OffsetDateTime.now()

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
            ExecutionContextMockBuilder.build()
        }

        listOf(
            Member.Type.ADMIN,
            Member.Type.STAFF,
            Member.Type.JUDGE,
            Member.Type.CONTESTANT,
            Member.Type.UNOFFICIAL_CONTESTANT,
        ).forEach { memberType ->
            test("should create session successfully for $memberType member") {
                val member = MemberMockBuilder.build(type = memberType)
                every { sessionRepository.save(any()) } answers { firstArg() }

                val result = sut.create(member)

                result.member shouldBe member
                result.expiresAt shouldBe ExecutionContext.get().startedAt.plusHours(1)
                verify { sessionRepository.save(result) }
                verify {
                    sessionDeleter.deleteAllByMember(
                        member,
                    )
                }
            }
        }

        test("should create session successfully for root member") {
            val member = MemberMockBuilder.build(type = Member.Type.ROOT)
            every { sessionRepository.save(any()) } answers { firstArg() }

            val result = sut.create(member)

            result.member shouldBe member
            result.expiresAt shouldBe ExecutionContext.get().startedAt.plusHours(1)
            verify { sessionRepository.save(result) }
            verify { sessionDeleter.deleteAllByMember(member) }
        }

        listOf(Member.Type.API, Member.Type.AUTOJUDGE).forEach { memberType ->
            test("should create session successfully for $memberType member") {
                val member = MemberMockBuilder.build(type = memberType)
                every { sessionRepository.save(any()) } answers { firstArg() }

                val result = sut.create(member)

                result.member shouldBe member
                result.expiresAt shouldBe ExecutionContext.get().startedAt.plusHours(1)
                verify { sessionRepository.save(result) }
                verify { sessionDeleter.deleteAllByMember(member) }
                verify { sessionCache.cache(result.toResponseBodyDTO()) }
            }
        }
    })
