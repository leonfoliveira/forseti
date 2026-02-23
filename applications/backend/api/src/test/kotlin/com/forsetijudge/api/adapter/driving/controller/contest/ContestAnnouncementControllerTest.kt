package com.forsetijudge.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.dto.request.announcement.CreateAnnouncementRequestBodyDTO
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.AnnouncementMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.announcement.CreateAnnouncementUseCase
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@WebMvcTest(controllers = [ContestAnnouncementController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestAnnouncementController::class])
class ContestAnnouncementControllerTest(
    @MockkBean(relaxed = true)
    private val createAnnouncementUseCase: CreateAnnouncementUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/api/v1/contests/{contestId}/announcements"
        val contestId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId, memberId)
        }

        test("create") {
            val body =
                CreateAnnouncementRequestBodyDTO(
                    text = "This is a test announcement",
                )
            val announcement = AnnouncementMockBuilder.build()
            val command =
                CreateAnnouncementUseCase.Command(
                    text = body.text,
                )
            every {
                createAnnouncementUseCase.execute(
                    command,
                )
            } returns announcement

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { announcement.toResponseBodyDTO() }
                }

            verify {
                createAnnouncementUseCase.execute(
                    command,
                )
            }
        }
    })
