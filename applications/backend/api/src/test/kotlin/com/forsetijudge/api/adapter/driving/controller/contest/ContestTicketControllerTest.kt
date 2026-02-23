package com.forsetijudge.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.dto.request.ticket.CreateTicketRequestBodyDTO
import com.forsetijudge.api.adapter.dto.request.ticket.UpdateTicketStatusRequestBodyDTO
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.ticket.CreateTicketUseCase
import com.forsetijudge.core.port.driving.usecase.external.ticket.UpdateTicketStatusUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
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
import org.springframework.test.web.servlet.put
import java.io.Serializable

@WebMvcTest(controllers = [ContestTicketController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestTicketController::class])
class ContestTicketControllerTest(
    @MockkBean(relaxed = true)
    private val createTicketUseCase: CreateTicketUseCase,
    @MockkBean(relaxed = true)
    private val updateTicketStatusUseCase: UpdateTicketStatusUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/api/v1/contests/{contestId}/tickets"
        val contestId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId, memberId)
        }

        test("create") {
            val contestId = IdGenerator.getUUID()
            val body =
                CreateTicketRequestBodyDTO(
                    type = Ticket.Type.TECHNICAL_SUPPORT,
                    properties = mapOf("description" to "I have a problem with the submission system."),
                )
            val ticket = TicketMockBuilder.build<Serializable>()
            val command =
                CreateTicketUseCase.Command(
                    type = body.type,
                    properties = body.properties,
                )
            every { createTicketUseCase.execute(command) } returns ticket

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { ticket.toResponseBodyDTO() }
                }

            verify { createTicketUseCase.execute(command) }
        }

        test("updateStatus") {
            val contestId = IdGenerator.getUUID()
            val ticketId = IdGenerator.getUUID()
            val body =
                UpdateTicketStatusRequestBodyDTO(
                    status = Ticket.Status.IN_PROGRESS,
                )
            val ticket = TicketMockBuilder.build<Serializable>()
            val command =
                UpdateTicketStatusUseCase.Command(
                    ticketId = ticketId,
                    status = body.status,
                )
            every { updateTicketStatusUseCase.execute(command) } returns ticket

            webMvc
                .put("$basePath/{ticketId}:update-status", contestId, ticketId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { ticket.toResponseBodyDTO() }
                }

            verify { updateTicketStatusUseCase.execute(command) }
        }
    })
