package com.forsetijudge.api.adapter.driven.listener

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.member.UpdatePasswordMemberUseCase
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class ApplicationReadyEventListenerTest :
    FunSpec({
        val updatePasswordMemberUseCase = mockk<UpdatePasswordMemberUseCase>(relaxed = true)
        val rootPassword = "root-password"

        val sut =
            ApplicationReadyEventApiListener(
                updatePasswordMemberUseCase = updatePasswordMemberUseCase,
                rootPassword = rootPassword,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should update system members") {
            sut.updateRootPassword()

            verify { updatePasswordMemberUseCase.update(Member.ROOT_ID, rootPassword) }
        }
    })
