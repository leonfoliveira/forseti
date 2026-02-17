package com.forsetijudge.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.dto.response.ticket.toResponseDTO
import com.forsetijudge.core.application.util.IdUtil
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.ticket.CreateTicketUseCase
import com.forsetijudge.core.port.driving.usecase.ticket.FindTicketUseCase
import com.forsetijudge.core.port.driving.usecase.ticket.UpdateTicketUseCase
import com.forsetijudge.core.port.dto.input.ticket.CreateTicketInputDTO
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
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import java.io.Serializable

@WebMvcTest(controllers = [ContestTicketController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestTicketController::class])
class ContestTicketControllerTest(
    @MockkBean(relaxed = true)
    private val createTicketUseCase: CreateTicketUseCase,
    @MockkBean(relaxed = true)
    private val updateTicketUseCase: UpdateTicketUseCase,
    @MockkBean(relaxed = true)
    private val findTicketUseCase: FindTicketUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val member = MemberMockBuilder.build()

        beforeEach {
            val session = SessionMockBuilder.build(member = member)
            RequestContext.getContext().session = session
        }

        val basePath = "/api/v1/contests/{contestId}/tickets"

        test("create") {
            val contestId = IdUtil.getUUIDv7()
            val body =
                CreateTicketInputDTO(
                    type = Ticket.Type.TECHNICAL_SUPPORT,
                    properties = mapOf("description" to "I have a problem with the submission system."),
                )
            val ticket = TicketMockBuilder.build<Serializable>()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every { createTicketUseCase.create(contestId, session.member.id, body) } returns ticket

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { ticket.toResponseDTO() }
                }

            verify { createTicketUseCase.create(contestId, session.member.id, body) }
        }

        test("updateStatus") {
            val contestId = IdUtil.getUUIDv7()
            val ticketId = IdUtil.getUUIDv7()
            val body = mapOf("status" to Ticket.Status.IN_PROGRESS)
            val ticket = TicketMockBuilder.build<Serializable>()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every { updateTicketUseCase.updateStatus(contestId, ticketId, session.member.id, Ticket.Status.IN_PROGRESS) } returns ticket

            webMvc
                .put("$basePath/{ticketId}:update-status", contestId, ticketId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { ticket.toResponseDTO() }
                }

            verify { updateTicketUseCase.updateStatus(contestId, ticketId, session.member.id, Ticket.Status.IN_PROGRESS) }
        }

        test("findAllByContestId") {
            val contestId = IdUtil.getUUIDv7()
            val ticket = TicketMockBuilder.build<Serializable>()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every { findTicketUseCase.findAllByContestId(contestId, session.member.id) } returns listOf(ticket)

            webMvc
                .get(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { listOf(ticket.toResponseDTO()) }
                }

            verify { findTicketUseCase.findAllByContestId(contestId, session.member.id) }
        }

        test("findAllBySignedInMember") {
            val contestId = IdUtil.getUUIDv7()
            val ticket = TicketMockBuilder.build<Serializable>()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every { findTicketUseCase.findAllByContestIdAndMemberId(contestId, session.member.id) } returns listOf(ticket)

            webMvc
                .get("$basePath/me", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { listOf(ticket.toResponseDTO()) }
                }

            verify { findTicketUseCase.findAllByContestIdAndMemberId(contestId, session.member.id) }
        }
    })
