package io.leonfoliveira.judge.api.controller

import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.util.SecurityContextMockFactory
import io.leonfoliveira.judge.core.domain.model.UploadAttachment
import io.leonfoliveira.judge.core.service.attachment.AttachmentService
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@AutoConfigureMockMvc
@SpringBootTest
class AttachmentControllerTest(
    val mockMvc: MockMvc,
    @MockkBean val attachmentService: AttachmentService,
) : FunSpec({
        val basePath = "/v1/attachments"

        beforeEach {
            mockkStatic(SecurityContextHolder::class)
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildRoot())
        }

        test("createUploadAttachment") {
            val uploadAttachment =
                UploadAttachment(
                    key = "key",
                    url = "https://example.com/key",
                )
            every { attachmentService.create() }
                .returns(uploadAttachment)

            mockMvc.post("$basePath/upload")
                .andExpect {
                    status { isOk() }
                    content { uploadAttachment }
                }
        }
    })
