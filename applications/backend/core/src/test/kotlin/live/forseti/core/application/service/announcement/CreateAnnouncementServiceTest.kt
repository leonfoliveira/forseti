package live.forseti.core.application.service.announcement

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import live.forseti.core.domain.entity.Announcement
import live.forseti.core.domain.entity.ContestMockBuilder
import live.forseti.core.domain.entity.MemberMockBuilder
import live.forseti.core.domain.event.AnnouncementCreatedEvent
import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.repository.AnnouncementRepository
import live.forseti.core.port.driven.repository.ContestRepository
import live.forseti.core.port.driven.repository.MemberRepository
import live.forseti.core.port.dto.input.announcement.CreateAnnouncementInputDTO
import org.springframework.context.ApplicationEventPublisher
import java.util.UUID

class CreateAnnouncementServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val announcementRepository = mockk<AnnouncementRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            CreateAnnouncementService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                announcementRepository = announcementRepository,
                applicationEventPublisher = applicationEventPublisher,
            )

        beforeEach {
            clearAllMocks()
        }

        val contestId = UUID.randomUUID()
        val memberId = UUID.randomUUID()

        context("create") {
            test("should throw NotFoundException when contest does not exist") {
                val input = CreateAnnouncementInputDTO(text = "Test Announcement")
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, input)
                }.message shouldBe "Could not find contest with id $contestId"
            }

            test("should throw NotFoundException when member does not exist in contest") {
                val input = CreateAnnouncementInputDTO(text = "Test Announcement")
                val contest = ContestMockBuilder.build()
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, input)
                }.message shouldBe "Could not find member with id $memberId"
            }

            test("should create announcement successfully") {
                val input = CreateAnnouncementInputDTO(text = "Test Announcement")
                val member = MemberMockBuilder.build(id = memberId)
                val contest = ContestMockBuilder.build(id = contestId)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { announcementRepository.save(any<Announcement>()) } answers { firstArg() }

                val announcement = sut.create(contestId, memberId, input)

                announcement.text shouldBe input.text
                announcement.contest.id shouldBe contestId
                announcement.member.id shouldBe memberId
                verify { announcementRepository.save(announcement) }
                val eventSlot = slot<AnnouncementCreatedEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
                eventSlot.captured.announcement shouldBe announcement
            }
        }
    })
