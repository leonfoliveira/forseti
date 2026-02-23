package com.forsetijudge.core.application.listener

import com.forsetijudge.core.application.util.SessionCache
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.member.UpdateMemberPasswordUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class ApplicationReadyEventListenerTest :
    FunSpec({
        val updateMemberPasswordUseCase = mockk<UpdateMemberPasswordUseCase>(relaxed = true)
        val sessionCache = mockk<SessionCache>(relaxed = true)
        val rootPassword = "root-password"

        val sut =
            ApplicationReadyEventListener(
                updateMemberPasswordUseCase = updateMemberPasswordUseCase,
                sessionCache = sessionCache,
                rootPassword = rootPassword,
            )

        val session = SessionMockBuilder.build()
        beforeEach {
            every { sessionCache.get(null, Member.API_ID) } returns session.toResponseBodyDTO()
        }

        test("should update root password on application ready") {
            sut.updateRootPassword()

            ExecutionContext.getSession() shouldBe session.toResponseBodyDTO()
            verify {
                updateMemberPasswordUseCase.execute(
                    UpdateMemberPasswordUseCase.Command(
                        memberId = Member.ROOT_ID,
                        password = rootPassword,
                    ),
                )
            }
        }
    })
