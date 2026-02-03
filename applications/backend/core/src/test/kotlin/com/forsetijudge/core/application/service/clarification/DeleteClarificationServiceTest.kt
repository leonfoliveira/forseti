package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.event.ClarificationDeletedEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ClarificationRepository
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher

class DeleteClarificationServiceTest :
    FunSpec({
        val clarificationRepository = mockk<ClarificationRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            DeleteClarificationService(
                clarificationRepository = clarificationRepository,
                applicationEventPublisher = applicationEventPublisher,
            )

        beforeEach {
            clearAllMocks()
        }

        context("delete") {
            val id = UuidCreator.getTimeOrderedEpoch()
            val contestId = UuidCreator.getTimeOrderedEpoch()

            test("should throw NotFoundException when clarification does not exist") {
                every { clarificationRepository.findByIdAndContestId(id, contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.delete(contestId, id)
                }.message shouldBe "Could not find clarification with id $id in contest"
            }

            test("should delete clarification and its children") {
                val answer = ClarificationMockBuilder.build()
                val clarification = ClarificationMockBuilder.build(children = listOf(answer))
                every { clarificationRepository.findByIdAndContestId(id, contestId) } returns clarification
                every { clarificationRepository.save(any<Clarification>()) } answers { firstArg() }

                sut.delete(contestId, id)

                clarification.deletedAt shouldNotBe null
                clarificationRepository.save(clarification)
                val eventSlot = slot<ClarificationDeletedEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
                eventSlot.captured.clarification shouldBe clarification
            }
        }
    })
