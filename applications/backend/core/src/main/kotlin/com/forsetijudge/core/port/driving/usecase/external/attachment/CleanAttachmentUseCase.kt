package com.forsetijudge.core.port.driving.usecase.external.attachment

interface CleanAttachmentUseCase {
    /**
     * Cleans up attachments that are no longer needed.
     */
    fun execute()
}
