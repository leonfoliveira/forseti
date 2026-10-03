package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.attachment.AttachmentCommiter
import com.forsetijudge.core.application.helper.problem.TestCasesValidator
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.contest.UpdateContestUseCase
import com.forsetijudge.core.port.output.cryptography.Hasher
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.ProblemRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.OffsetDateTime

class UpdateContestServiceTest {
    private val contests = mock<ContestRepository>()
    private val problems = mock<ProblemRepository>()
    private val members = mock<MemberRepository>()
    private val hasher = mock<Hasher>()
    private val validator = mock<TestCasesValidator>()
    private val committer = mock<AttachmentCommiter>()
    private val events = mock<BusinessEventPublisher>()
    private val service = UpdateContestService(contests, problems, members, hasher, validator, committer, events)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `updates contest attributes and emits update event`() {
        val startAt = OffsetDateTime.now().plusHours(1).truncatedTo(java.time.temporal.ChronoUnit.SECONDS)
        val endAt = startAt.plusHours(1)
        val contest = MockEntityFactory.contest(startAt = startAt, endAt = endAt)
        val admin = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)
        TestAuthentication.setMember(admin)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(admin.id, contest.id)).thenReturn(admin)
        whenever(contests.existsBySlugAndIdNot("updated", contest.id)).thenReturn(false)
        val command =
            UpdateContestUseCase.Command(
                contestId = contest.id,
                slug = "updated",
                title = "Updated title",
                languages = listOf(Submission.Language.JAVA_21),
                startAt = startAt,
                endAt = endAt,
                members = emptyList(),
                problems = emptyList(),
            )

        val response = service.execute(command)

        assertEquals(contest.id, response.id)
        assertEquals("updated", contest.slug)
        assertEquals("Updated title", contest.title)
        assertEquals(listOf(Submission.Language.JAVA_21), contest.languages)
        verify(contests).save(contest)
        verify(events).publish(ContestEvent.Updated(contest.id))
    }

    @Test
    fun `rejects root member additions and duplicate slug`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1))
        val root = MockEntityFactory.member(type = Member.Type.ROOT)
        TestAuthentication.setMember(root)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(root.id, contest.id)).thenReturn(root)
        val command =
            UpdateContestUseCase.Command(
                contestId = contest.id,
                slug = "next",
                title = "Next contest",
                languages = listOf(Submission.Language.CPP_17),
                startAt = contest.startAt,
                endAt = contest.endAt,
                members =
                    listOf(
                        UpdateContestUseCase.Command.Member(
                            type = Member.Type.ROOT,
                            name = "Root",
                            login = "root2",
                            password = "pw",
                        ),
                    ),
                problems = emptyList(),
            )
        assertThrows<ForbiddenException> { service.execute(command) }

        whenever(contests.existsBySlugAndIdNot("next", contest.id)).thenReturn(true)
        assertThrows<ConflictException> {
            service.execute(command.copy(members = emptyList()))
        }
        verify(contests, never()).save(any())
    }

    @Test
    fun `throws when contest cannot be found`() {
        val contestId = java.util.UUID.randomUUID()
        val root = MockEntityFactory.member(type = Member.Type.ROOT)
        TestAuthentication.setMember(root)
        whenever(contests.findById(contestId)).thenReturn(null)
        val command =
            UpdateContestUseCase.Command(
                contestId,
                "slug",
                "Title",
                listOf(Submission.Language.CPP_17),
                OffsetDateTime.now().plusHours(1),
                OffsetDateTime.now().plusHours(2),
                emptyList(),
                emptyList(),
            )
        assertThrows<NotFoundException> { service.execute(command) }
    }
}
