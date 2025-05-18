package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.domain.model.Attachment
import io.leonfoliveira.judge.core.domain.model.DownloadAttachment
import io.leonfoliveira.judge.core.domain.model.UploadAttachment

interface BucketAdapter {
    fun createUploadAttachment(): UploadAttachment

    fun createDownloadAttachment(attachment: Attachment): DownloadAttachment

    fun download(attachment: Attachment): ByteArray
}
