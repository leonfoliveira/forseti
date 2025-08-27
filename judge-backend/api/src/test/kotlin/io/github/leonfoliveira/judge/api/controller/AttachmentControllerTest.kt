package io.github.leonfoliveira.judge.api.controller

import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.dto.response.toResponseDTO
import io.github.leonfoliveira.judge.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.judge.common.service.attachment.AttachmentService
import io.github.leonfoliveira.judge.common.service.dto.output.AttachmentDownloadOutputDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.mockk
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.multipart
import org.springframework.web.multipart.MultipartFile

@WebMvcTest(controllers = [AttachmentController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [AttachmentController::class])
class AttachmentControllerTest(
    @MockkBean(relaxed = true)
    val attachmentService: AttachmentService,
    val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/attachments"

        test("uploadAttachment") {
            val file = mockk<MultipartFile>(relaxed = true)
            val attachment = AttachmentMockBuilder.build()
            every { attachmentService.upload(file) } returns attachment

            webMvc.multipart(basePath) {
                file("file", file.bytes)
            }.andExpect {
                status { isOk() }
                content { attachment.toResponseDTO() }
            }
        }

        test("downloadAttachment") {
            val attachment = AttachmentMockBuilder.build()
            val bytes = "test data".toByteArray()
            every { attachmentService.download(attachment.id) } returns
                AttachmentDownloadOutputDTO(
                    attachment = attachment,
                    bytes = bytes,
                )

            webMvc.get("$basePath/{attachmentId}", attachment.id) {
                accept = MediaType.APPLICATION_OCTET_STREAM
            }.andExpect {
                status { isOk() }
                content { bytes }
                header { string("Content-Disposition", "attachment; filename=\"${attachment.filename}\"") }
                header { string("Content-Type", attachment.contentType) }
            }
        }
    })
