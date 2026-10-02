package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class FindAllContestServiceTest {
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val service = FindAllContestService(contests, members)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `returns all contests for root member`() {
        val root = MockEntityFactory.member(type = Member.Type.ROOT)
        val all = listOf(MockEntityFactory.contest(), MockEntityFactory.contest())
        TestAuthentication.setMember(root)
        whenever(members.findById(root.id)).thenReturn(root)
        whenever(contests.findAllOrdersByCreatedAt()).thenReturn(all)

        assertEquals(all.map { it.id }, service.execute().map { it.id })
    }

    @Test
    fun `rejects non-root or missing member`() {
        val admin = MockEntityFactory.member(type = Member.Type.ADMIN)
        TestAuthentication.setMember(admin)
        whenever(members.findById(admin.id)).thenReturn(admin)

        assertThrows(ForbiddenException::class.java) { service.execute() }
        verify(contests, never()).findAllOrdersByCreatedAt()

        TestAuthentication.setMember(admin)
        whenever(members.findById(admin.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) { service.execute() }
    }
}
