package io.github.leonfoliveira.forseti.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.api.adapter.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.submission.toPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.util.ContestAuthFilter
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.application.dto.input.attachment.AttachmentInputDTO
import io.github.leonfoliveira.forseti.common.application.dto.input.submission.CreateSubmissionInputDTO
import io.github.leonfoliveira.forseti.common.application.port.driving.CreateSubmissionUseCase
import io.github.leonfoliveira.forseti.common.application.port.driving.FindSubmissionUseCase
import io.github.leonfoliveira.forseti.common.application.port.driving.UpdateSubmissionUseCase
import io.github.leonfoliveira.forseti.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SubmissionMockBuilder
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
import java.util.UUID

@WebMvcTest(controllers = [ContestSubmissionController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestSubmissionController::class])
class ContestSubmissionControllerTest(
    @MockkBean(relaxed = true)
    private val contestAuthFilter: ContestAuthFilter,
    @MockkBean(relaxed = true)
    private val createSubmissionUseCase: CreateSubmissionUseCase,
    @MockkBean(relaxed = true)
    private val findSubmissionUseCase: FindSubmissionUseCase,
    @MockkBean(relaxed = true)
    private val updateSubmissionUseCase: UpdateSubmissionUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val member = MemberMockBuilder.build()

        beforeEach {
            val session = SessionMockBuilder.build(member = member)
            RequestContext.getContext().session = session
        }

        val basePath = "/v1/contests/{contestId}/submissions"

        test("createSubmission") {
            val contestId = UUID.randomUUID()
            val body =
                CreateSubmissionInputDTO(
                    problemId = UUID.randomUUID(),
                    language = Submission.Language.PYTHON_312,
                    code = AttachmentInputDTO(id = UUID.randomUUID()),
                )
            val submission = SubmissionMockBuilder.build()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every { createSubmissionUseCase.create(session.member.id, body) } returns submission

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { submission.toFullResponseDTO() }
                }

            verify { contestAuthFilter.checkIfStarted(contestId) }
            verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
            verify { createSubmissionUseCase.create(session.member.id, body) }
        }

        test("findAllContestSubmissions") {
            val contestId = UUID.randomUUID()
            val submissions =
                listOf(
                    SubmissionMockBuilder.build(),
                    SubmissionMockBuilder.build(),
                )
            every { findSubmissionUseCase.findAllByContest(contestId) } returns submissions

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
            every { findSubmissionUseCase.findAllByContest(contestId) } returns submissions

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
            every { findSubmissionUseCase.findAllByMember(member.id) } returns submissions
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
            val id = UUID.randomUUID()
            val answer = Submission.Answer.ACCEPTED

            webMvc
                .put("$basePath/{id}/answer/{answer}", contestId, id, answer) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify { updateSubmissionUseCase.updateAnswer(id, answer) }
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
            verify { updateSubmissionUseCase.updateAnswer(submissionId, answer, force = true) }
        }

        test("rerunSubmission") {
            val contestId = UUID.randomUUID()
            val id = UUID.randomUUID()

            webMvc
                .post("$basePath/{id}/rerun", contestId, id) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
            verify { updateSubmissionUseCase.rerun(id) }
        }
    })
