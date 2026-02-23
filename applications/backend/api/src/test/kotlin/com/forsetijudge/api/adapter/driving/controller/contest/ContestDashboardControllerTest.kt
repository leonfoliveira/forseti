package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.api.adapter.driving.advice.GlobalExceptionHandler
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.dashboard.AdminDashboardMockBuilder
import com.forsetijudge.core.domain.model.dashboard.ContestantDashboardMockBuilder
import com.forsetijudge.core.domain.model.dashboard.GuestDashboardMockBuilder
import com.forsetijudge.core.domain.model.dashboard.JudgeDashboardMockBuilder
import com.forsetijudge.core.domain.model.dashboard.StaffDashboardMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildAdminDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildContestantDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildGuestDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildJudgeDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildStaffDashboardUseCase
import com.forsetijudge.core.port.dto.response.dashboard.toResponseBodyDTO
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.clearAllMocks
import io.mockk.every
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(controllers = [ContestDashboardController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestDashboardController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class ContestDashboardControllerTest(
    @MockkBean(relaxed = true)
    private val buildAdminDashboardUseCase: BuildAdminDashboardUseCase,
    @MockkBean(relaxed = true)
    private val buildContestantDashboardUseCase: BuildContestantDashboardUseCase,
    @MockkBean(relaxed = true)
    private val buildGuestDashboardUseCase: BuildGuestDashboardUseCase,
    @MockkBean(relaxed = true)
    private val buildJudgeDashboardUseCase: BuildJudgeDashboardUseCase,
    @MockkBean(relaxed = true)
    private val buildStaffDashboardUseCase: BuildStaffDashboardUseCase,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/api/v1/contests/{contestId}/dashboard"
        val contestId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId, memberId)
        }

        test("getAdminDashboard") {
            val dashboard = AdminDashboardMockBuilder.build()
            every { buildAdminDashboardUseCase.execute() } returns dashboard

            webMvc
                .get("$basePath/admin", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { dashboard.toResponseBodyDTO() }
                }
        }

        test("getContestantDashboard") {
            val dashboard = ContestantDashboardMockBuilder.build()
            every { buildContestantDashboardUseCase.execute() } returns dashboard

            webMvc
                .get("$basePath/contestant", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { dashboard.toResponseBodyDTO() }
                }
        }

        test("getGuestDashboard") {
            val dashboard = GuestDashboardMockBuilder.build()
            every { buildGuestDashboardUseCase.execute() } returns dashboard

            webMvc
                .get("$basePath/guest", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { dashboard.toResponseBodyDTO() }
                }
        }

        test("getJudgeDashboard") {
            val dashboard = JudgeDashboardMockBuilder.build()
            every { buildJudgeDashboardUseCase.execute() } returns dashboard

            webMvc
                .get("$basePath/judge", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { dashboard.toResponseBodyDTO() }
                }
        }

        test("getStaffDashboard") {
            val dashboard = StaffDashboardMockBuilder.build()
            every { buildStaffDashboardUseCase.execute() } returns dashboard

            webMvc
                .get("$basePath/staff", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { dashboard.toResponseBodyDTO() }
                }
        }
    })
