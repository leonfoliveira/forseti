package io.github.leonfoliveira.forseti.api.adapter.driving.controller.contest

import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.api.adapter.dto.response.toResponseDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import live.forseti.core.domain.entity.AttachmentMockBuilder
import live.forseti.core.domain.entity.SessionMockBuilder
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.attachment.AuthorizeAttachmentUseCase
import live.forseti.core.port.driving.usecase.attachment.DownloadAttachmentUseCase
import live.forseti.core.port.driving.usecase.attachment.UploadAttachmentUseCase
import live.forseti.core.port.dto.output.AttachmentDownloadOutputDTO
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
    val uploadAttachmentUseCase: UploadAttachmentUseCase,
    @MockkBean(relaxed = true)
    val downloadAttachmentUseCase: DownloadAttachmentUseCase,
    @MockkBean(relaxed = true)
    val authorizeAttachmentUseCase: AuthorizeAttachmentUseCase,
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
                uploadAttachmentUseCase.upload(
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

            verify { authorizeAttachmentUseCase.authorizeUpload(contestId, attachment.context) }
        }

        test("downloadAttachment") {
            val contestId = UUID.randomUUID()
            val attachment = AttachmentMockBuilder.build()
            val bytes = "test data".toByteArray()
            every { downloadAttachmentUseCase.download(attachment.id) } returns
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

            verify { authorizeAttachmentUseCase.authorizeDownload(contestId, attachment.id) }
        }
    })
