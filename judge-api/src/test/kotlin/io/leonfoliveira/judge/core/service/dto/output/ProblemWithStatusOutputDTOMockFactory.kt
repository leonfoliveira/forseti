package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Attachment
import io.leonfoliveira.judge.core.domain.entity.AttachmentMockFactory

object ProblemWithStatusOutputDTOMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Sample Problem",
        description: Attachment = AttachmentMockFactory.build(),
        isAccepted: Boolean = false,
        wrongSubmissions: Int = 0,
    ) = ProblemWithStatusOutputDTO(
        id = id,
        title = title,
        description = description,
        isAccepted = isAccepted,
        wrongSubmissions = wrongSubmissions,
    )
}
