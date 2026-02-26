package com.forsetijudge.core.application.service.external.member

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.Hasher
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.member.UpdateMemberPasswordUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class UpdateMemberPasswordServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val hasher = mockk<Hasher>(relaxed = true)

        val sut =
            UpdateMemberPasswordService(
                memberRepository = memberRepository,
                hasher = hasher,
            )

        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(memberId = contextMemberId)
        }

        val command =
            UpdateMemberPasswordUseCase.Command(
                memberId = IdGenerator.getUUID(),
                password = "newPassword",
            )

        test("should throw NotFoundException when context member does not exist") {
            every { memberRepository.findById(contextMemberId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        Member.Type.entries.filter { it != Member.Type.API }.forEach { memberType ->
            test("should throw ForbiddenException when context member is not of type API (type = $memberType)") {
                val contextMember = MemberMockBuilder.build(id = contextMemberId, type = memberType)
                every { memberRepository.findById(contextMemberId) } returns contextMember

                shouldThrow<ForbiddenException> {
                    sut.execute(command)
                }
            }
        }

        test("should throw NotFoundException when member does not exist") {
            every { memberRepository.findById(contextMemberId) } returns
                MemberMockBuilder.build(id = contextMemberId, type = Member.Type.API)
            every { memberRepository.findById(command.memberId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should update member password successfully") {
            val member = MemberMockBuilder.build()
            every { memberRepository.findById(contextMemberId) } returns
                MemberMockBuilder.build(id = contextMemberId, type = Member.Type.API)
            every { memberRepository.findById(command.memberId) } returns member
            every { hasher.hash(command.password) } returns "hashedNewPassword"
            every { memberRepository.save(any()) } returnsArgument 0

            sut.execute(command)

            verify { memberRepository.save(member) }
            member.password shouldBe "hashedNewPassword"
        }
    })
