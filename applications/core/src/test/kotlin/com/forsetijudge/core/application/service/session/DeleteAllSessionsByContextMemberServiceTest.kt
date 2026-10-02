package com.forsetijudge.core.application.service.session

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.application.helper.session.SessionDeleter
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.test.factory.MockEntityFactory
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class DeleteAllSessionsByContextMemberServiceTest {
    private val members = mock<MemberRepository>()
    private val deleter = mock<SessionDeleter>()
    private val service = DeleteAllSessionsByContextMemberService(members, deleter)

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `deletes sessions belonging to the authenticated member`() {
        val member = MockEntityFactory.member(type = Member.Type.ADMIN)
        TestAuthentication.setMember(member)
        whenever(members.findById(member.id)).thenReturn(member)

        service.execute()

        verify(deleter).deleteByMember(member)
    }

    @Test
    fun `fails when authenticated member no longer exists`() {
        val member = MockEntityFactory.member()
        TestAuthentication.setMember(member)
        whenever(members.findById(member.id)).thenReturn(null)

        assertThrows(NotFoundException::class.java) { service.execute() }
        verify(deleter, org.mockito.kotlin.never()).deleteByMember(org.mockito.kotlin.any())
    }
}
