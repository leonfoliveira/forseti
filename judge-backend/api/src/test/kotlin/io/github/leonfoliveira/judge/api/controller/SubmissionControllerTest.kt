package io.github.leonfoliveira.judge.api.controller

import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
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

@WebMvcTest(controllers = [SubmissionController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [SubmissionController::class])
class SubmissionControllerTest(
    @MockkBean(relaxed = true)
    private val contestAuthFilter: ContestAuthFilter,
    @MockkBean(relaxed = true)
    private val findSubmissionService: FindSubmissionService,
    @MockkBean(relaxed = true)
    private val updateSubmissionService: UpdateSubmissionService,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val member = AuthorizationMockBuilder.buildMember()

        beforeEach {
            val authorization = AuthorizationMockBuilder.build(member=member)
            SecurityContextHolder.getContext().authentication = JwtAuthentication(authorization)
        }

        test("findAllFullSubmissionsForMember") {
            val submissions = listOf(SubmissionMockBuilder.build(), SubmissionMockBuilder.build())
            every { findSubmissionService.findAllByMember(member.id) } returns submissions

            webMvc.get("/v1/submissions/full/me") {
                accept = MediaType.APPLICATION_JSON
            }.andExpect {
                status { isOk() }
                content { submissions }
            }
        }

        test("updateSubmissionAnswer") {
            val submissionId = UUID.randomUUID()
            val answer = Submission.Answer.ACCEPTED

            webMvc.put("/v1/submissions/{id}/answer/{answer}", submissionId, answer) {
                contentType = MediaType.APPLICATION_JSON
            }.andExpect {
                status { isNoContent() }
            }

            verify { updateSubmissionService.updateAnswer(submissionId, answer) }
        }

        test("updateSubmissionAnswerForce") {
            val submissionId = UUID.randomUUID()
            val answer = Submission.Answer.ACCEPTED

            webMvc.put("/v1/submissions/{id}/answer/{answer}/force", submissionId, answer) {
                contentType = MediaType.APPLICATION_JSON
            }.andExpect {
                status { isNoContent() }
            }

            verify { contestAuthFilter.checkFromSubmission(submissionId) }
            verify { updateSubmissionService.updateAnswer(submissionId, answer, force = true) }
        }

        test("rerunSubmission") {
            val submissionId = UUID.randomUUID()

            webMvc.post("/v1/submissions/{id}/rerun", submissionId) {
                contentType = MediaType.APPLICATION_JSON
            }.andExpect {
                status { isNoContent() }
            }

            verify { contestAuthFilter.checkFromSubmission(submissionId) }
            verify { updateSubmissionService.rerun(submissionId) }
        }
    })
