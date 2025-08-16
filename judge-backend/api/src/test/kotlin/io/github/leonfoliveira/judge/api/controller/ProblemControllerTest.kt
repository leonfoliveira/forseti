package io.github.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.service.dto.input.attachment.AttachmentInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.submission.CreateSubmissionInputDTO
import io.github.leonfoliveira.judge.common.service.submission.CreateSubmissionService
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import java.util.UUID

@WebMvcTest(controllers = [ProblemController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ProblemController::class])
class ProblemControllerTest(
    @MockkBean(relaxed = true)
    private val contestAuthFilter: ContestAuthFilter,
    @MockkBean(relaxed = true)
    private val createSubmissionService: CreateSubmissionService,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val objectMapper = jacksonObjectMapper()

        test("createSubmission") {
            val problemId = UUID.randomUUID()
            val body =
                CreateSubmissionInputDTO(
                    language = Language.PYTHON_3_13,
                    code = AttachmentInputDTO(id = UUID.randomUUID()),
                )
            val authorization = AuthorizationMockBuilder.build()
            SecurityContextHolder.getContext().authentication = JwtAuthentication(authorization)
            val submission = SubmissionMockBuilder.build()
            every { createSubmissionService.create(authorization.member.id, problemId, body) } returns submission

            webMvc.post("/v1/problems/{id}/submissions", problemId) {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(body)
            }.andExpect {
                status { isOk() }
                content { submission }
            }

            verify { contestAuthFilter.checkFromProblem(problemId) }
        }
    })
