package com.forsetijudge.core.application.service.member

import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.Hasher
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class UpdatePasswordMemberServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val hasher = mockk<Hasher>(relaxed = true)

        val sut =
            UpdatePasswordMemberService(
                memberRepository = memberRepository,
                hasher = hasher,
            )

        beforeEach {
            every { memberRepository.save(any()) } returnsArgument 0
        }

        context("update") {
            val memberId = UuidCreator.getTimeOrderedEpoch()
            val password = "newPassword"

            test("should throw NotFoundException when member does not exist") {
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> { sut.update(memberId, password) }
                    .message shouldBe "Could not find member with id = $memberId"
            }

            test("should update member password successfully") {
                val member = MemberMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns member
                every { hasher.hash(password) } returns "hashedPassword"
                every { memberRepository.save(member) } returns member

                val result = sut.update(memberId, password)

                result.shouldBe(member)
                result.password shouldBe "hashedPassword"
                verify { hasher.hash(password) }
                verify { memberRepository.save(member) }
            }
        }
    })
