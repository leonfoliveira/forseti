package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.BusinessEvent
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.Repository
import java.util.UUID

interface BusinessEventRepository : Repository<BusinessEvent<*>, Unit> {
    fun save(businessEvent: BusinessEvent<*>)

    @Query("SELECT be FROM BusinessEvent be WHERE be.id = :id AND be.type = :type")
    fun findByIdAndType(
        id: UUID,
        type: String,
    ): BusinessEvent<*>?
}
