package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk

class FindAllContestServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)

        val sut = FindAllContestService(contestRepository, memberRepository)

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        test(" should throw NotFoundException when member not found") {
            every { memberRepository.findById(contextMemberId) } returns null

            shouldThrow<NotFoundException> { sut.execute() }
        }

        Member.Type.entries.filter { it != Member.Type.ROOT }.forEach { memberTyme ->
            test(" should throw ForbiddenException when member is of type $memberTyme") {
                val member = MemberMockBuilder.build(type = memberTyme)
                every {
                    memberRepository.findById(contextMemberId)
                } returns member

                shouldThrow<ForbiddenException> { sut.execute() }
            }
        }

        test("should return list of contests") {
            val contests = listOf(ContestMockBuilder.build(), ContestMockBuilder.build())
            val member = MemberMockBuilder.build(type = Member.Type.ROOT)
            every { contestRepository.findAllOrdersByCreatedAt() } returns contests
            every { memberRepository.findById(contextMemberId) } returns member

            val result = sut.execute()

            result shouldBe contests
        }
    })
