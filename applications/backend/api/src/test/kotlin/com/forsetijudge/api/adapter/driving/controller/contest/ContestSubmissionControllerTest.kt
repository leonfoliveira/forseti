package com.forsetijudge.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.dto.response.submission.toFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.submission.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.contest.AuthorizeContestUseCase
import com.forsetijudge.core.port.driving.usecase.submission.CreateSubmissionUseCase
import com.forsetijudge.core.port.driving.usecase.submission.FindSubmissionUseCase
import com.forsetijudge.core.port.driving.usecase.submission.UpdateSubmissionUseCase
import com.forsetijudge.core.port.dto.input.attachment.AttachmentInputDTO
import com.forsetijudge.core.port.dto.input.submission.CreateSubmissionInputDTO
import com.forsetijudge.core.port.dto.request.UpdateSubmissionAnswerRequestDTO
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
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@WebMvcTest(controllers = [ContestSubmissionController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestSubmissionController::class])
class ContestSubmissionControllerTest(
    @MockkBean(relaxed = true)
    private val authorizeContestUseCase: AuthorizeContestUseCase,
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

        val basePath = "/api/v1/contests/{contestId}/submissions"

        test("createSubmission") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val body =
                CreateSubmissionInputDTO(
                    problemId = UuidCreator.getTimeOrderedEpoch(),
                    language = Submission.Language.PYTHON_312,
                    code = AttachmentInputDTO(id = UuidCreator.getTimeOrderedEpoch()),
                )
            val submission = SubmissionMockBuilder.build()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every { createSubmissionUseCase.create(contestId, session.member.id, body) } returns submission

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { submission.toFullResponseDTO() }
                }

            verify { createSubmissionUseCase.create(contestId, session.member.id, body) }
        }

        test("findAllContestSubmissions") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val submissions =
                listOf(
                    SubmissionMockBuilder.build(),
                    SubmissionMockBuilder.build(),
                )
            every { findSubmissionUseCase.findAllByContest(contestId, any()) } returns submissions

            webMvc
                .get(basePath, contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { submissions.map { it.toPublicResponseDTO() } }
                }
        }

        test("findAllContestFullSubmissions") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val submissions =
                listOf(
                    SubmissionMockBuilder.build(),
                    SubmissionMockBuilder.build(),
                )
            every { findSubmissionUseCase.findAllByContest(contestId, any()) } returns submissions

            webMvc
                .get("$basePath/full", contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { submissions.map { it.toFullResponseDTO() } }
                }
        }

        test("findAllFullSubmissionsForMember") {
            val submissions = listOf(SubmissionMockBuilder.build(), SubmissionMockBuilder.build())
            every { findSubmissionUseCase.findAllByMember(member.id) } returns submissions
            val contestId = UuidCreator.getTimeOrderedEpoch()

            webMvc
                .get("$basePath/members/me", contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { submissions }
                }
        }

        test("updateSubmissionAnswer") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val id = UuidCreator.getTimeOrderedEpoch()
            val answer = Submission.Answer.ACCEPTED
            val body = UpdateSubmissionAnswerRequestDTO(answer = answer)

            webMvc
                .put("$basePath/{id}:update-answer", contestId, id) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isNoContent() }
                }

            verify { updateSubmissionUseCase.updateAnswer(id, answer) }
        }

        test("updateSubmissionAnswerForce") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val submissionId = UuidCreator.getTimeOrderedEpoch()
            val answer = Submission.Answer.ACCEPTED
            val body = UpdateSubmissionAnswerRequestDTO(answer = answer)

            webMvc
                .put("$basePath/{id}:update-answer-force", contestId, submissionId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isNoContent() }
                }

            verify { updateSubmissionUseCase.updateAnswer(submissionId, answer, force = true) }
        }

        test("rerunSubmission") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val id = UuidCreator.getTimeOrderedEpoch()

            webMvc
                .post("$basePath/{id}:rerun", contestId, id) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify { updateSubmissionUseCase.rerun(id) }
        }
    })
