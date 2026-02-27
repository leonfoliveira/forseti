package com.forsetijudge.core.port.driving.usecase.external.attachment

interface CleanUncommitedAttachmentsUseCase {
    /**
     * Cleans up attachments that are no longer needed.
     */
    fun execute()
}
