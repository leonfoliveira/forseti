package live.forseti.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.verify
import live.forseti.api.adapter.dto.response.submission.toFullResponseDTO
import live.forseti.api.adapter.dto.response.submission.toPublicResponseDTO
import live.forseti.core.domain.entity.MemberMockBuilder
import live.forseti.core.domain.entity.SessionMockBuilder
import live.forseti.core.domain.entity.Submission
import live.forseti.core.domain.entity.SubmissionMockBuilder
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.contest.AuthorizeContestUseCase
import live.forseti.core.port.driving.usecase.submission.CreateSubmissionUseCase
import live.forseti.core.port.driving.usecase.submission.FindSubmissionUseCase
import live.forseti.core.port.driving.usecase.submission.UpdateSubmissionUseCase
import live.forseti.core.port.dto.input.attachment.AttachmentInputDTO
import live.forseti.core.port.dto.input.submission.CreateSubmissionInputDTO
import live.forseti.core.port.dto.request.UpdateSubmissionAnswerRequestDTO
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

            verify { authorizeContestUseCase.checkIfStarted(contestId) }
            verify { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) }
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

            verify { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) }
        }

        test("findAllFullSubmissionsForMember") {
            val submissions = listOf(SubmissionMockBuilder.build(), SubmissionMockBuilder.build())
            every { findSubmissionUseCase.findAllByMember(member.id) } returns submissions
            val contestId = UUID.randomUUID()

            webMvc
                .get("$basePath/members/me", contestId) {
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
            val contestId = UUID.randomUUID()
            val submissionId = UUID.randomUUID()
            val answer = Submission.Answer.ACCEPTED
            val body = UpdateSubmissionAnswerRequestDTO(answer = answer)

            webMvc
                .put("$basePath/{id}:update-answer-force", contestId, submissionId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isNoContent() }
                }

            verify { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) }
            verify { updateSubmissionUseCase.updateAnswer(submissionId, answer, force = true) }
        }

        test("rerunSubmission") {
            val contestId = UUID.randomUUID()
            val id = UUID.randomUUID()

            webMvc
                .post("$basePath/{id}:rerun", contestId, id) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) }
            verify { updateSubmissionUseCase.rerun(id) }
        }
    })
