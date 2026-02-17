package com.forsetijudge.core.application.service.ticket

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.IdUtil
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkConstructor
import io.mockk.verify
import java.io.Serializable

class FindTicketServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>()
        val memberRepository = mockk<MemberRepository>()
        val ticketRepository = mockk<TicketRepository>()

        val sut =
            FindTicketService(
                contestRepository,
                memberRepository,
                ticketRepository,
            )

        val contestAuthorizer = mockk<ContestAuthorizer>(relaxed = true)

        beforeEach {
            clearAllMocks()
            mockkConstructor(ContestAuthorizer::class)
            every { anyConstructed<ContestAuthorizer>().checkContestStarted() } returns contestAuthorizer
            every { anyConstructed<ContestAuthorizer>().checkMemberType(*anyVararg<Member.Type>()) } returns contestAuthorizer
        }

        context("findAllByContestId") {
            val contestId = IdUtil.getUUIDv7()
            val memberId = IdUtil.getUUIDv7()

            test("should throwNotFoundException if contest does not exist") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> { sut.findAllByContestId(contestId, memberId) }
            }

            test("should throwNotFoundException if member does not exist") {
                every { contestRepository.findEntityById(contestId) } returns ContestMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> { sut.findAllByContestId(contestId, memberId) }
            }

            test("should return tickets if contest and member exist") {
                val tickets = listOf(TicketMockBuilder.build<Serializable>(), TicketMockBuilder.build())
                val contest =
                    ContestMockBuilder.build(
                        tickets = tickets,
                    )
                val member = MemberMockBuilder.build()
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member

                sut.findAllByContestId(contestId, memberId) shouldBe tickets
                verify { anyConstructed<ContestAuthorizer>().checkMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF) }
            }
        }

        context("findAllByContestIdAndMemberId") {
            val contestId = IdUtil.getUUIDv7()
            val memberId = IdUtil.getUUIDv7()

            test("should throwNotFoundException if contest does not exist") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> { sut.findAllByContestIdAndMemberId(contestId, memberId) }
            }

            test("should throwNotFoundException if member does not exist") {
                every { contestRepository.findEntityById(contestId) } returns ContestMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> { sut.findAllByContestIdAndMemberId(contestId, memberId) }
            }

            test("should return tickets if contest and member exist") {
                val tickets = listOf(TicketMockBuilder.build<Serializable>(), TicketMockBuilder.build())
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { ticketRepository.findAllByContestIdAndMemberId(contestId, memberId) } returns tickets

                sut.findAllByContestIdAndMemberId(contestId, memberId) shouldBe tickets
                verify { anyConstructed<ContestAuthorizer>().checkContestStarted() }
            }
        }
    })
