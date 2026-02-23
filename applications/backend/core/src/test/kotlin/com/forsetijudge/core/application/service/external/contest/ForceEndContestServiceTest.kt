package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
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

class ForceEndContestServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            ForceEndContestService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
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

        test("should throw NotFoundException when contest does not exist") {
            every { contestRepository.findById(any()) } returns null

            shouldThrow<NotFoundException> {
                sut.execute()
            }
        }

        test("should throw NotFoundException when member does not exist") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contest.id) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute()
            }
        }

        Member.Type.entries.filter { it !in setOf(Member.Type.ROOT, Member.Type.ADMIN) }.forEach { memberType ->
            test("should throw ForbiddenException when member is of type $memberType") {
                val contest = ContestMockBuilder.build()
                val member =
                    MemberMockBuilder.build(
                        type = memberType,
                        contest = contest,
                    )
                every { contestRepository.findById(contest.id) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> {
                    sut.execute()
                }
            }
        }

        test("should throw ForbiddenException when trying to force end a contest that is not active") {
            val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
            val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

            shouldThrow<ForbiddenException> {
                sut.execute()
            }
        }

        test("should force start contest successfully") {
            val contest =
                ContestMockBuilder.build(
                    startAt = ExecutionContext.get().startedAt.minusHours(1),
                    endAt = ExecutionContext.get().startedAt.plusHours(1),
                )
            val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
            every { contestRepository.save(any()) } returnsArgument 0

            sut.execute()

            contest.endAt shouldBe now
            verify { applicationEventPublisher.publishEvent(match<ContestEvent.Updated> { it.contest == contest }) }
        }
    })
