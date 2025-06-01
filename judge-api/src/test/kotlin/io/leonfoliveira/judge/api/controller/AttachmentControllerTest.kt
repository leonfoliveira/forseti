package io.leonfoliveira.judge.api.controller

import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.util.SecurityContextMockFactory
import io.leonfoliveira.judge.config.ControllerTest
import io.leonfoliveira.judge.core.domain.entity.AttachmentMockFactory
import io.leonfoliveira.judge.core.service.attachment.AttachmentService
import io.leonfoliveira.judge.core.service.dto.output.AttachmentDownloadOutputDTOMockFactory
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.multipart

@ControllerTest([AttachmentController::class])
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

        test("upload") {
            val attachment = AttachmentMockFactory.build()
            every { attachmentService.upload(any()) }
                .returns(attachment)

            mockMvc.multipart(basePath) {
                file("file", ByteArray(0))
            }
                .andExpect {
                    status { isOk() }
                    content { attachment }
                }
        }

        test("download") {
            val key = AttachmentMockFactory.build().key
            val bytes = ByteArray(0)
            every { attachmentService.download(key) }
                .returns(AttachmentDownloadOutputDTOMockFactory.build())

            mockMvc.get("$basePath/$key")
                .andExpect {
                    status { isOk() }
                    content { bytes }
                }
        }
    })
