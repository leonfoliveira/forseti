package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.attachment.DownloadAttachmentUseCase
import com.forsetijudge.core.port.driving.usecase.external.attachment.UploadAttachmentUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.mock.web.MockMultipartFile
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

        val basePath = "/v1/contests/{contestId}/attachments"
        val contestId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId, memberId)
        }

        test("upload") {
            val fileName = "test.txt"
            val contentType = "application/octet-stream"
            val testBytes = "test content".toByteArray()
            val attachment = AttachmentMockBuilder.build()
            val command =
                UploadAttachmentUseCase.Command(
                    filename = fileName,
                    contentType = contentType,
                    context = attachment.context,
                    bytes = ByteArray(0),
                )
            every {
                uploadAttachmentUseCase.execute(
                    any(),
                )
            } returns Pair(attachment, testBytes)
            val file =
                MockMultipartFile(
                    "file",
                    command.filename,
                    command.contentType,
                    testBytes,
                )

            webMvc
                .multipart("$basePath?context=${attachment.context}", contestId) {
                    file(file)
                }.andExpect {
                    status { isOk() }
                    jsonPath("$.id") { exists() }
                }
        }

        test("download") {
            val attachment =
                AttachmentMockBuilder.build(
                    filename = "test.txt",
                    contentType = "application/octet-stream",
                )
            val bytes = "test data".toByteArray()
            val command =
                DownloadAttachmentUseCase.Command(
                    attachmentId = attachment.id,
                )
            every {
                downloadAttachmentUseCase.execute(command)
            } returns Pair(attachment, bytes)

            webMvc
                .get("$basePath/{attachmentId}", contestId, attachment.id)
                .andExpect {
                    status { isOk() }
                    header { string("Content-Disposition", "attachment; filename=\"${attachment.filename}\"") }
                    header { string("Content-Type", attachment.contentType) }
                    content { bytes(bytes) }
                }

            verify {
                downloadAttachmentUseCase.execute(command)
            }
        }
    })
