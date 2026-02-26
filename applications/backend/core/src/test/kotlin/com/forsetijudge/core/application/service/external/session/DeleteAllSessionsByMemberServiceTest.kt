package com.forsetijudge.core.application.service.external.session

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.internal.session.DeleteAllSessionsByMemberInternalUseCase
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.assertThrows

class DeleteAllSessionsByMemberServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val deleteAllSessionsByMemberInternalUseCase = mockk<DeleteAllSessionsByMemberInternalUseCase>(relaxed = true)

        val sut =
            DeleteAllSessionsByMemberService(
                memberRepository = memberRepository,
                deleteAllSessionsByMemberInternalUseCase = deleteAllSessionsByMemberInternalUseCase,
            )

        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(memberId = contextMemberId)
        }

        test("should throw NotFoundException when member is not found") {
            every { memberRepository.findById(contextMemberId) } returns null

            assertThrows<NotFoundException> {
                sut.execute()
            }
        }

        test("should delete all sessions for the member when member is found") {
            val member = MemberMockBuilder.build()
            every { memberRepository.findById(contextMemberId) } returns member

            sut.execute()

            verify {
                deleteAllSessionsByMemberInternalUseCase.execute(
                    DeleteAllSessionsByMemberInternalUseCase.Command(
                        member = member,
                    ),
                )
            }
        }
    })
