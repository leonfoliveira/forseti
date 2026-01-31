package com.forsetijudge.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.dto.response.announcement.toResponseDTO
import com.forsetijudge.core.domain.entity.AnnouncementMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.announcement.CreateAnnouncementUseCase
import com.forsetijudge.core.port.driving.usecase.contest.AuthorizeContestUseCase
import com.forsetijudge.core.port.dto.input.announcement.CreateAnnouncementInputDTO
import com.github.f4b6a3.uuid.UuidCreator
import com.ninjasquad.springmockk.MockkBean
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

@WebMvcTest(controllers = [ContestAnnouncementController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestAnnouncementController::class])
class ContestAnnouncementControllerTest(
    @MockkBean(relaxed = true)
    private val createAnnouncementUseCase: CreateAnnouncementUseCase,
    @MockkBean(relaxed = true)
    private val authorizeContestUseCase: AuthorizeContestUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/api/v1/contests/{contestId}/announcements"

        test("createAnnouncement") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val body =
                CreateAnnouncementInputDTO(
                    text = "This is a test announcement",
                )
            val announcement = AnnouncementMockBuilder.build()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every { createAnnouncementUseCase.execute(contestId, session.member.id, body) } returns announcement

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { announcement.toResponseDTO() }
                }

            verify { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) }
        }
    })
