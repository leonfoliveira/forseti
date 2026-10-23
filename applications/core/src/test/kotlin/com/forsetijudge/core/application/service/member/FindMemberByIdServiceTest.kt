package com.forsetijudge.core.application.service.member

import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.member.toResponseDTO
import com.forsetijudge.core.port.input.usecase.member.FindMemberByIdUseCase
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class FindMemberByIdServiceTest {
    private val memberRepository = mock<MemberRepository>()
    private val service = FindMemberByIdService(memberRepository)

    @Test
    fun `should throw NotFoundException when member is not found`() {
        whenever(memberRepository.findByIdNullable(any())).thenReturn(null)

        assertThrows<NotFoundException> {
            service.execute(FindMemberByIdUseCase.Command(memberId = IdGenerator.getUUID()))
        }
    }

    @Test
    fun `should return member when found`() {
        val member = MockEntityFactory.member()
        whenever(memberRepository.findByIdNullable(member.id)).thenReturn(member)

        val result = service.execute(FindMemberByIdUseCase.Command(memberId = member.id))

        assertEquals(member.toResponseDTO(), result)
    }
}
