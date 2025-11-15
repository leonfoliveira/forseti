package io.github.leonfoliveira.forseti.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.api.adapter.dto.response.announcement.toResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.util.ContestAuthFilter
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.application.service.announcement.CreateAnnouncementService
import io.github.leonfoliveira.forseti.common.application.service.dto.input.announcement.CreateAnnouncementInputDTO
import io.github.leonfoliveira.forseti.common.mock.entity.AnnouncementMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import java.util.UUID

@WebMvcTest(controllers = [ContestAnnouncementController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestAnnouncementController::class])
class ContestAnnouncementControllerTest(
    @MockkBean(relaxed = true)
    private val createAnnouncementService: CreateAnnouncementService,
    @MockkBean(relaxed = true)
    private val contestAuthFilter: ContestAuthFilter,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/contests/{contestId}/announcements"

        test("createAnnouncement") {
            val contestId = UUID.randomUUID()
            val body =
                CreateAnnouncementInputDTO(
                    text = "This is a test announcement",
                )
            val announcement = AnnouncementMockBuilder.build()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every { createAnnouncementService.create(contestId, session.member.id, body) } returns announcement

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { announcement.toResponseDTO() }
                }

            verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
        }
    })
