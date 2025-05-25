package io.leonfoliveira.judge.core.repository

import io.leonfoliveira.judge.core.domain.entity.Attachment
import java.util.UUID
import org.springframework.data.repository.CrudRepository

interface AttachmentRepository : CrudRepository<Attachment, UUID>
