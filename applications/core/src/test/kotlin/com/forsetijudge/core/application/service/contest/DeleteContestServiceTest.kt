package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.contest.DeleteContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.OffsetDateTime

class DeleteContestServiceTest {
    private val members = mock<MemberRepository>()
    private val contests = mock<ContestRepository>()
    private val events = mock<BusinessEventPublisher>()
    private val service = DeleteContestService(members, contests, events)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `soft deletes contest and publishes event for root`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1))
        val root = MockEntityFactory.member(type = Member.Type.ROOT)
        TestAuthentication.setMember(root)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(root.id, contest.id)).thenReturn(root)

        service.execute(DeleteContestUseCase.Command(contest.id))

        assertNotNull(contest.deletedAt)
        verify(contests).save(contest)
        verify(events).publish(ContestEvent.Deleted(contest.id))
    }

    @Test
    fun `rejects non-root user and missing contest`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1))
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)
        assertThrows(ForbiddenException::class.java) { service.execute(DeleteContestUseCase.Command(contest.id)) }
        verify(contests, never()).save(any())

        whenever(contests.findById(contest.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) { service.execute(DeleteContestUseCase.Command(contest.id)) }
    }
}
