package io.github.leonfoliveira.judge.api.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.controller.advice.GlobalExceptionHandler
import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toPublicResponseDTO
import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.config.JacksonConfig
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.service.dto.input.attachment.AttachmentInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.submission.CreateSubmissionInputDTO
import io.github.leonfoliveira.judge.common.service.submission.CreateSubmissionService
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.github.leonfoliveira.judge.common.service.submission.UpdateSubmissionService
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
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import java.util.UUID

@WebMvcTest(controllers = [ContestSubmissionController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestSubmissionController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class ContestSubmissionControllerTest(
    @MockkBean(relaxed = true)
    private val contestAuthFilter: ContestAuthFilter,
    @MockkBean(relaxed = true)
    private val createSubmissionService: CreateSubmissionService,
    @MockkBean(relaxed = true)
    private val findSubmissionService: FindSubmissionService,
    @MockkBean(relaxed = true)
    private val updateSubmissionService: UpdateSubmissionService,
    private val objectMapper: ObjectMapper,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val member = MemberMockBuilder.build()

        beforeEach {
            val session = SessionMockBuilder.build(member = member)
            SecurityContextHolder.getContext().authentication = JwtAuthentication(session)
        }

        val basePath = "/v1/contests/{contestId}/submissions"

        test("createSubmission") {
            val contestId = UUID.randomUUID()
            val body =
                CreateSubmissionInputDTO(
                    problemId = UUID.randomUUID(),
                    language = Language.PYTHON_3_12,
                    code = AttachmentInputDTO(id = UUID.randomUUID()),
                )
            val submission = SubmissionMockBuilder.build()
            every { createSubmissionService.create(member.id, body) } returns submission

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { submission.toFullResponseDTO() }
                }

            verify { contestAuthFilter.checkIfStarted(contestId) }
            verify { createSubmissionService.create(member.id, body) }
        }

        test("findAllContestSubmissions") {
            val contestId = UUID.randomUUID()
            val submissions =
                listOf(
                    SubmissionMockBuilder.build(),
                    SubmissionMockBuilder.build(),
                )
            every { findSubmissionService.findAllByContest(contestId) } returns submissions

            webMvc
                .get(basePath, contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { submissions.map { it.toPublicResponseDTO() } }
                }
        }

        test("findAllContestFullSubmissions") {
            val contestId = UUID.randomUUID()
            val submissions =
                listOf(
                    SubmissionMockBuilder.build(),
                    SubmissionMockBuilder.build(),
                )
            every { findSubmissionService.findAllByContest(contestId) } returns submissions

            webMvc
                .get("$basePath/full", contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { submissions.map { it.toFullResponseDTO() } }
                }

            verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
        }

        test("findAllFullSubmissionsForMember") {
            val submissions = listOf(SubmissionMockBuilder.build(), SubmissionMockBuilder.build())
            every { findSubmissionService.findAllByMember(member.id) } returns submissions
            val contestId = UUID.randomUUID()

            webMvc
                .get("$basePath/full/members/me", contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { submissions }
                }
        }

        test("updateSubmissionAnswer") {
            val contestId = UUID.randomUUID()
            val submissionId = UUID.randomUUID()
            val answer = Submission.Answer.ACCEPTED

            webMvc
                .put("$basePath/{id}/answer/{answer}", contestId, submissionId, answer) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify { updateSubmissionService.updateAnswer(submissionId, answer) }
        }

        test("updateSubmissionAnswerForce") {
            val contestId = UUID.randomUUID()
            val submissionId = UUID.randomUUID()
            val answer = Submission.Answer.ACCEPTED

            webMvc
                .put("$basePath/{id}/answer/{answer}/force", contestId, submissionId, answer) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
            verify { updateSubmissionService.updateAnswer(submissionId, answer, force = true) }
        }

        test("rerunSubmission") {
            val contestId = UUID.randomUUID()
            val submissionId = UUID.randomUUID()

            webMvc
                .post("$basePath/{id}/rerun", contestId, submissionId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
            verify { updateSubmissionService.rerun(submissionId) }
        }
    })
