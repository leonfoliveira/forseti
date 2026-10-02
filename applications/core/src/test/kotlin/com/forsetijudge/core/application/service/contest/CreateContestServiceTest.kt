package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.contest.CreateContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.OffsetDateTime

class CreateContestServiceTest {
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val events = mock<BusinessEventPublisher>()
    private val service = CreateContestService(contests, members, events)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `creates contest and publishes created event for root`() {
        val root = MockEntityFactory.member(type = Member.Type.ROOT)
        TestAuthentication.setMember(root)
        whenever(members.findById(root.id)).thenReturn(root)
        whenever(contests.existsBySlug("spring-cup")).thenReturn(false)
        val command =
            CreateContestUseCase.Command(
                slug = "spring-cup",
                title = "Spring Cup",
                languages = listOf(Submission.Language.CPP_17),
                startAt = OffsetDateTime.now().plusHours(1),
                endAt = OffsetDateTime.now().plusHours(2),
            )

        val result = service.execute(command)

        assertEquals(command.slug, result.slug)
        assertEquals(command.title, result.title)
        verify(contests).save(any())
        verify(events).publish(
            org.mockito.kotlin.check { event ->
                assertEquals(ContestEvent.Created(result.id), event)
            },
        )
    }

    @Test
    fun `requires existing root and unused slug`() {
        val user = MockEntityFactory.member(type = Member.Type.CONTESTANT)
        TestAuthentication.setMember(user)
        whenever(members.findById(user.id)).thenReturn(user)
        val command = createCommand()
        assertThrows(ForbiddenException::class.java) { service.execute(command) }

        val root = MockEntityFactory.member(type = Member.Type.ROOT)
        TestAuthentication.setMember(root)
        whenever(members.findById(root.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) { service.execute(command) }

        whenever(members.findById(root.id)).thenReturn(root)
        whenever(contests.existsBySlug(command.slug)).thenReturn(true)
        assertThrows(ConflictException::class.java) { service.execute(command) }
        verify(contests, never()).save(any())
    }

    private fun createCommand() =
        CreateContestUseCase.Command(
            "spring-cup",
            "Spring Cup",
            listOf(Submission.Language.CPP_17),
            OffsetDateTime.now().plusHours(1),
            OffsetDateTime.now().plusHours(2),
        )
}
