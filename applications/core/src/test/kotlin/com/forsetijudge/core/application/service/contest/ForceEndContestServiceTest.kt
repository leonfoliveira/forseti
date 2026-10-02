package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.contest.ForceEndContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class ForceEndContestServiceTest {
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val events = mock<BusinessEventPublisher>()
    private val service = ForceEndContestService(contests, members, events)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `ends active contest and publishes update`() {
        val contest = MockEntityFactory.contest()
        val admin = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)
        TestAuthentication.setMember(admin)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(admin.id, contest.id)).thenReturn(admin)

        val response = service.execute(ForceEndContestUseCase.Command(contest.id))

        assertEquals(contest.id, response.id)
        assertTrue(contest.hasEnded())
        verify(contests).save(contest)
        verify(events).publish(ContestEvent.Updated(contest.id))
    }

    @Test
    fun `rejects member without force end permission`() {
        val contest = MockEntityFactory.contest()
        val contestant = MockEntityFactory.member(contest = contest)
        TestAuthentication.setMember(contestant)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByIdAndContestIdOrContestIsNull(contestant.id, contest.id)).thenReturn(contestant)

        assertThrows(ForbiddenException::class.java) {
            service.execute(ForceEndContestUseCase.Command(contest.id))
        }
        verify(contests, never()).save(any())
    }
}
