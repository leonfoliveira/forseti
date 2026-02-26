package com.forsetijudge.core.application.service.external.clarification

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.ClarificationRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.clarification.DeleteClarificationUseCase
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

class DeleteClarificationServiceTest :
    FunSpec({
        val clarificationRepository = mockk<ClarificationRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            DeleteClarificationService(
                clarificationRepository = clarificationRepository,
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

        val command =
            DeleteClarificationUseCase.Command(
                clarificationId = IdGenerator.getUUID(),
            )

        test("should throw NotFoundException when clarification does not exist") {
            every { clarificationRepository.findByIdAndContestId(command.clarificationId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw NotFoundException when member does not exist") {
            val clarification = ClarificationMockBuilder.build()
            every { clarificationRepository.findByIdAndContestId(command.clarificationId, contextContestId) } returns clarification
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        Member.Type.entries.filter { it !in setOf(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE) }.forEach { memberType ->
            test("should throw ForbiddenException when member type is $memberType") {
                val clarification = ClarificationMockBuilder.build()
                val member = MemberMockBuilder.build(type = memberType)
                every { clarificationRepository.findByIdAndContestId(command.clarificationId, contextContestId) } returns clarification
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, clarification.contest.id) } returns member

                shouldThrow<ForbiddenException> {
                    sut.execute(command)
                }
            }
        }

        test("should delete clarification successfully") {
            val clarification = ClarificationMockBuilder.build()
            val member = MemberMockBuilder.build(type = Member.Type.JUDGE)
            every { clarificationRepository.findByIdAndContestId(command.clarificationId, contextContestId) } returns clarification
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
            every { clarificationRepository.save(any()) } returnsArgument 0

            sut.execute(command)

            clarification.deletedAt shouldBe now
            verify { clarificationRepository.save(clarification) }
            verify { applicationEventPublisher.publishEvent(match<ClarificationEvent.Deleted> { it.clarification == clarification }) }
        }
    })
