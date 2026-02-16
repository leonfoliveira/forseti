package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.event.LeaderboardFreezeEvent
import com.forsetijudge.core.domain.event.LeaderboardUnfreezeEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkConstructor
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.assertThrows
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class FreezeLeaderboardServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            FreezeLeaderboardService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                applicationEventPublisher = applicationEventPublisher,
            )

        val contestId = UuidCreator.getTimeOrderedEpoch()
        val memberId = UuidCreator.getTimeOrderedEpoch()

        val contestAuthorizer = mockk<ContestAuthorizer>(relaxed = true)

        beforeEach {
            clearAllMocks()
            mockkConstructor(ContestAuthorizer::class)
            every { anyConstructed<ContestAuthorizer>().checkContestStarted() } returns contestAuthorizer
            every { anyConstructed<ContestAuthorizer>().checkMemberType() } returns contestAuthorizer
        }

        context("freeze") {
            test("should throw NotFoundException if contest does not exist") {
                every { contestRepository.findEntityById(contestId) } returns null

                assertThrows<NotFoundException> {
                    sut.freeze(contestId, memberId)
                }
            }

            test("should throw NotFoundException if member does not exist") {
                every { contestRepository.findEntityById(contestId) } returns ContestMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns null

                assertThrows<NotFoundException> {
                    sut.freeze(contestId, memberId)
                }
            }

            test("should throw ForbiddenException if leaderboard is already frozen") {
                val contest = ContestMockBuilder.build(frozenAt = OffsetDateTime.now().minusMinutes(10))
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns MemberMockBuilder.build(type = Member.Type.ADMIN)

                assertThrows<ForbiddenException> {
                    sut.freeze(contestId, memberId)
                }
            }

            test("should freeze the leaderboard successfully") {
                val contest = ContestMockBuilder.build(frozenAt = null)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns MemberMockBuilder.build(type = Member.Type.ADMIN)
                every { contestRepository.save(any()) } returnsArgument 0

                sut.freeze(contestId, memberId)

                verify { contestRepository.save(contest) }
                contest.frozenAt shouldNotBe null
                val eventSlot = slot<LeaderboardFreezeEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
                eventSlot.captured.contest shouldBe contest
            }
        }

        context("unfreeze") {
            test("should throw NotFoundException if contest does not exist") {
                every { contestRepository.findEntityById(contestId) } returns null

                assertThrows<NotFoundException> {
                    sut.unfreeze(contestId, memberId)
                }
            }

            test("should throw NotFoundException if member does not exist") {
                every { contestRepository.findEntityById(contestId) } returns ContestMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns null

                assertThrows<NotFoundException> {
                    sut.unfreeze(contestId, memberId)
                }
            }

            listOf(Member.Type.CONTESTANT, Member.Type.JUDGE).forEach { memberType ->
                test("should throw ForbiddenException if member is of type $memberType") {
                    every { contestRepository.findEntityById(contestId) } returns ContestMockBuilder.build()
                    every { memberRepository.findEntityById(memberId) } returns MemberMockBuilder.build(type = memberType)

                    assertThrows<ForbiddenException> {
                        sut.unfreeze(contestId, memberId)
                    }
                }
            }

            test("should throw ForbiddenException if leaderboard is not frozen") {
                val contest = ContestMockBuilder.build(frozenAt = null)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns MemberMockBuilder.build(type = Member.Type.ADMIN)

                assertThrows<ForbiddenException> {
                    sut.unfreeze(contestId, memberId)
                }
            }

            test("should unfreeze the leaderboard successfully") {
                val contest = ContestMockBuilder.build(frozenAt = OffsetDateTime.now().minusMinutes(10))
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns MemberMockBuilder.build(type = Member.Type.ADMIN)
                every { contestRepository.save(any()) } returnsArgument 0

                sut.unfreeze(contestId, memberId)

                verify { contestRepository.save(contest) }
                contest.frozenAt shouldBe null
                val eventSlot = slot<LeaderboardUnfreezeEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
                eventSlot.captured.contest shouldBe contest
            }
        }
    })
