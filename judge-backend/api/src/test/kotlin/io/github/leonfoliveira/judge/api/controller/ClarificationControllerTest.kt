package io.github.leonfoliveira.judge.api.controller

import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.common.service.clarification.DeleteClarificationService
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import java.util.UUID

@WebMvcTest(controllers = [ClarificationController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ClarificationController::class])
class ClarificationControllerTest(
    @MockkBean(relaxed = true)
    private val deleteClarificationService: DeleteClarificationService,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        test("deleteClarificationById") {
            val id = UUID.randomUUID()

            webMvc.delete("/v1/clarifications/{id}", id) {
                contentType = MediaType.APPLICATION_JSON
            }.andExpect {
                status { isNoContent() }
            }

            verify { deleteClarificationService.delete(id) }
        }
    })
