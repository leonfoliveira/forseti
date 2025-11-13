package io.github.leonfoliveira.forseti.api.controller.contest

import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.api.dto.response.toResponseDTO
import io.github.leonfoliveira.forseti.api.service.attachment.AttachmentAuthorizationService
import io.github.leonfoliveira.forseti.common.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.github.leonfoliveira.forseti.common.service.attachment.AttachmentService
import io.github.leonfoliveira.forseti.common.service.dto.output.AttachmentDownloadOutputDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.multipart
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@WebMvcTest(controllers = [ContestAttachmentController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestAttachmentController::class])
class ContestAttachmentControllerTest(
    @MockkBean(relaxed = true)
    val attachmentService: AttachmentService,
    @MockkBean(relaxed = true)
    val attachmentAuthorizationService: AttachmentAuthorizationService,
    val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/contests/{contestId}/attachments"

        test("uploadAttachment") {
            val contestId = UUID.randomUUID()
            val file = mockk<MultipartFile>(relaxed = true)
            val attachment = AttachmentMockBuilder.build()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every {
                attachmentService.upload(
                    contestId = contestId,
                    memberId = session.member.id,
                    filename = file.originalFilename,
                    contentType = file.contentType,
                    context = attachment.context,
                    bytes = file.bytes,
                )
            } returns attachment

            webMvc
                .multipart("$basePath/${attachment.context}", contestId) {
                    file("file", file.bytes)
                }.andExpect {
                    status { isOk() }
                    content { attachment.toResponseDTO() }
                }

            verify { attachmentAuthorizationService.authorizeUpload(contestId, attachment.context) }
        }

        test("downloadAttachment") {
            val contestId = UUID.randomUUID()
            val attachment = AttachmentMockBuilder.build()
            val bytes = "test data".toByteArray()
            every { attachmentService.download(attachment.id) } returns
                AttachmentDownloadOutputDTO(
                    attachment = attachment,
                    bytes = bytes,
                )

            webMvc
                .get("$basePath/{attachmentId}", contestId, attachment.id) {
                    accept = MediaType.APPLICATION_OCTET_STREAM
                }.andExpect {
                    status { isOk() }
                    content { bytes }
                    header { string("Content-Disposition", "attachment; filename=\"${attachment.filename}\"") }
                    header { string("Content-Type", attachment.contentType) }
                }

            verify { attachmentAuthorizationService.authorizeDownload(contestId, attachment.id) }
        }
    })
