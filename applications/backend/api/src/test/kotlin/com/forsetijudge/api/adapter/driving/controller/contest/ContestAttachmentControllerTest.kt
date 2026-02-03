package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.attachment.DownloadAttachmentUseCase
import com.forsetijudge.core.port.driving.usecase.attachment.UploadAttachmentUseCase
import com.forsetijudge.core.port.dto.output.AttachmentDownloadOutputDTO
import com.github.f4b6a3.uuid.UuidCreator
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.clearAllMocks
import io.mockk.every
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.multipart

@WebMvcTest(controllers = [ContestAttachmentController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestAttachmentController::class])
class ContestAttachmentControllerTest(
    @MockkBean(relaxed = true)
    val uploadAttachmentUseCase: UploadAttachmentUseCase,
    @MockkBean(relaxed = true)
    val downloadAttachmentUseCase: DownloadAttachmentUseCase,
    val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/api/v1/contests/{contestId}/attachments"

        beforeEach {
            clearAllMocks()
        }

        test("uploadAttachment") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val testBytes = "test content".toByteArray()
            val attachment = AttachmentMockBuilder.build()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every {
                uploadAttachmentUseCase.upload(
                    contestId = contestId,
                    memberId = session.member.id,
                    filename = any(),
                    contentType = any(),
                    context = attachment.context,
                    bytes = any(),
                )
            } returns attachment

            webMvc
                .multipart("$basePath?context=${attachment.context}", contestId) {
                    file("file", testBytes)
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.id") { exists() }
                }
        }

        test("downloadAttachment") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val attachment =
                AttachmentMockBuilder.build(
                    filename = "test.txt",
                    contentType = "application/octet-stream",
                )
            val bytes = "test data".toByteArray()
            every { downloadAttachmentUseCase.download(contestId, any(), attachment.id) } returns
                AttachmentDownloadOutputDTO(
                    attachment = attachment,
                    bytes = bytes,
                )

            webMvc
                .get("$basePath/{attachmentId}", contestId, attachment.id)
                .andExpect {
                    status { isOk() }
                }
        }
    })
