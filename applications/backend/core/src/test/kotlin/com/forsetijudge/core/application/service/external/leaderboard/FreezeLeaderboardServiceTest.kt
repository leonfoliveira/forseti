package com.forsetijudge.core.application.service.external.leaderboard

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.entity.freeze
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class FreezeLeaderboardServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val frozenSubmissionRepository = mockk<FrozenSubmissionRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            FreezeLeaderboardService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                submissionRepository = submissionRepository,
                frozenSubmissionRepository = frozenSubmissionRepository,
                applicationEventPublisher = applicationEventPublisher,
            )

        val now = OffsetDateTime.now()
        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        test("should throw NotFoundException when the contest does not exist") {
            every { contestRepository.findById(any()) } returns null

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

        test("should throw ForbiddenException when the leaderboard is already frozen") {
            val contest = ContestMockBuilder.build(frozenAt = ExecutionContext.get().startedAt.minusHours(1))
            val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

            shouldThrow<ForbiddenException> {
                sut.execute()
            }
        }

        test("should freeze the leaderboard successfully") {
            val contest = ContestMockBuilder.build(frozenAt = null)
            val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
            val submissions = listOf(SubmissionMockBuilder.build())
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
            every { submissionRepository.findAllByContestId(contest.id) } returns submissions
            every { contestRepository.save(any()) } returnsArgument 0
            every { frozenSubmissionRepository.saveAll(any()) } returnsArgument 0

            val result = sut.execute()

            result shouldBe contest
            contest.frozenAt shouldBe now
            verify { frozenSubmissionRepository.saveAll(any()) }
            verify { contestRepository.save(contest) }
            verify { applicationEventPublisher.publishEvent(match<LeaderboardEvent.Frozen> { it.contest == contest }) }
        }
    })
