package com.forsetijudge.core.application.service.external.leaderboard

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.event.LeaderboardEvent
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
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class UnfreezeLeaderboardServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            UnfreezeLeaderboardService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                applicationEventPublisher = applicationEventPublisher,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        test("should throw NotFoundException when the contest does not exist") {
            every { contestRepository.findById(contextContestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute()
            }
        }

        test("should throw NotFoundException when the member does not exist") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute()
            }
        }

        Member.Type.entries.filter { it !in setOf(Member.Type.ROOT, Member.Type.ADMIN) }.forEach { memberType ->
            test("should throw ForbiddenException if member type is $memberType") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = memberType, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> {
                    sut.execute()
                }
            }
        }

        test("should throw ForbiddenException when the leaderboard is not frozen") {
            val contest = ContestMockBuilder.build(frozenAt = null)
            val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

            shouldThrow<ForbiddenException> {
                sut.execute()
            }
        }

        test("should unfreeze the leaderboard successfully") {
            val contest = ContestMockBuilder.build(frozenAt = OffsetDateTime.now().minusHours(1))
            val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
            every { contestRepository.save(any()) } returnsArgument 0

            sut.execute()

            contest.frozenAt shouldBe null
            verify { contestRepository.save(contest) }
            verify { applicationEventPublisher.publishEvent(match<LeaderboardEvent.Unfrozen> { it.contest == contest }) }
        }
    })
