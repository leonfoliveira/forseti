package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.event.ContestEvent
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
import io.mockk.mockkStatic
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class DeleteContestServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            DeleteContestService(
                memberRepository = memberRepository,
                contestRepository = contestRepository,
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

        context("create") {
            test("should throw NotFoundException when member not found") {
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.execute()
                }
            }

            test("should throw NotFoundException when contest not found") {
                val member = MemberMockBuilder.build(type = Member.Type.ROOT)
                every { contestRepository.findById(contextContestId) } returns null
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<NotFoundException> {
                    sut.execute()
                }
            }

            Member.Type.entries.filter { it != Member.Type.ROOT }.forEach { memberType ->
                test("should throw ForbiddenException when member is $memberType") {
                    val contest = ContestMockBuilder.build()
                    val member = MemberMockBuilder.build(type = memberType)
                    every { contestRepository.findById(contextContestId) } returns contest
                    every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                    shouldThrow<ForbiddenException> {
                        sut.execute()
                    }
                }
            }

            test("should throw ForbiddenException when contest has already started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.ROOT)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> {
                    sut.execute()
                }
            }

            test("should delete contest successfully") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.ROOT)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { contestRepository.save(any()) } returnsArgument 0

                sut.execute()

                contest.deletedAt shouldBe now
                verify { contestRepository.save(contest) }
                verify {
                    applicationEventPublisher.publishEvent(
                        match<ContestEvent.Deleted> {
                            it.contest == contest
                        },
                    )
                }
            }
        }
    })
