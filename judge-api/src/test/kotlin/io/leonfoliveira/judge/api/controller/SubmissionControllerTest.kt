package io.leonfoliveira.judge.api.controller

import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.util.SecurityContextMockFactory
import io.leonfoliveira.judge.core.service.dto.output.SubmissionOutputDTOMockFactory
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@AutoConfigureMockMvc
@SpringBootTest
class SubmissionControllerTest(
    val mockMvc: MockMvc,
    @MockkBean val findSubmissionService: FindSubmissionService,
) : FunSpec({
        beforeEach {
            mockkStatic(SecurityContextHolder::class)
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildContestant())
        }

        val basePath = "/v1/submissions"

        test("findAllForMember") {
            val submissions = listOf(SubmissionOutputDTOMockFactory.build())
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildContestant())
            every { findSubmissionService.findAllByMember(any()) }
                .returns(submissions)

            mockMvc.get("$basePath/me")
                .andExpect {
                    status { isOk() }
                    content { submissions }
                }
        }
    })
