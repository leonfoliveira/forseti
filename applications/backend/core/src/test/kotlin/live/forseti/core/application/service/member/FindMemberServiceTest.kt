package live.forseti.core.application.service.member

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import live.forseti.core.domain.entity.MemberMockBuilder
import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.repository.MemberRepository
import java.util.UUID

class FindMemberServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)

        val sut =
            FindMemberService(
                memberRepository = memberRepository,
            )

        context("findById") {
            val memberId = UUID.randomUUID()

            test("should throw NotFoundException when member does not exist") {
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> { sut.findById(memberId) }
                    .message shouldBe "Could not find member with id = $memberId"
            }

            test("should return member when it exists") {
                val member = MemberMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns member

                val result = sut.findById(memberId)

                result shouldBe member
            }
        }
    })
