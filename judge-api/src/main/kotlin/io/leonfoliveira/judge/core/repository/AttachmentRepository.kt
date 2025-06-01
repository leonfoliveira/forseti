package io.leonfoliveira.judge.core.repository

import io.leonfoliveira.judge.core.domain.entity.Attachment
import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface AttachmentRepository : CrudRepository<Attachment, UUID>
