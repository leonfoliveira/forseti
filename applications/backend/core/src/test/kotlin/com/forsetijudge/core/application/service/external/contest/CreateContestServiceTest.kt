package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.contest.CreateContestUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class CreateContestServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            CreateContestService(
                memberRepository = memberRepository,
                contestRepository = contestRepository,
                applicationEventPublisher = applicationEventPublisher,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        context("create") {
            val command =
                CreateContestUseCase.Command(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                )

            test("should NotFoundException when member does not exist") {
                every { memberRepository.findById(contextMemberId) } returns null

                shouldThrow<NotFoundException> {
                    sut.execute(command)
                }
            }

            Member.Type.entries.filter { it != Member.Type.ROOT }.forEach { memberType ->
                test("should throw ForbiddenException when member is of type $memberType") {
                    val member = MemberMockBuilder.build(type = memberType)
                    every { memberRepository.findById(contextMemberId) } returns member

                    shouldThrow<ForbiddenException> {
                        sut.execute(command)
                    }
                }
            }

            test("should throw ConflictException when contest with same slug already exists") {
                val member = MemberMockBuilder.build(type = Member.Type.ROOT)
                every { memberRepository.findById(contextMemberId) } returns member
                every { contestRepository.existsBySlug(command.slug) } returns true

                shouldThrow<ConflictException> {
                    sut.execute(command)
                }
            }

            test("should create contest successfully") {
                val member = MemberMockBuilder.build(type = Member.Type.ROOT)
                every { memberRepository.findById(contextMemberId) } returns member
                every { contestRepository.existsBySlug(command.slug) } returns false
                every { contestRepository.save(any<Contest>()) } answers { firstArg() }

                val result = sut.execute(command)

                val contestSlot = slot<Contest>()
                verify { contestRepository.save(capture(contestSlot)) }
                val contest = contestSlot.captured
                result shouldBe contest
                verify {
                    applicationEventPublisher.publishEvent(
                        match<ContestEvent.Created> {
                            it.contest == contest
                        },
                    )
                }
            }
        }
    })
