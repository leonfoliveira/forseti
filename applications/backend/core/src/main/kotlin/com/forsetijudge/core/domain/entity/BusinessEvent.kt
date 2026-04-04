package com.forsetijudge.core.domain.entity

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.model.BeanContext
import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.persistence.Column
import jakarta.persistence.DiscriminatorColumn
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.io.Serializable
import java.lang.reflect.ParameterizedType
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "business_event")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type")
open class BusinessEvent<TPayload : Serializable>(
    @Id
    val id: UUID = IdGenerator.getUUID(),
    @Column(name = "created_at", nullable = false)
    val createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
    @Column(name = "updated_at", nullable = false)
    val updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: Status = Status.PENDING,
    @Column(nullable = false)
    val type: String,
    @Column(nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    val payload: Map<String, Any>,
) {
    enum class Status {
        PENDING,
        PROCESSED,
    }

    companion object {
        private val rawPropertiesTypeReference = object : TypeReference<Map<String, Any>>() {}
        private val objectMapper: ObjectMapper
            get() = BeanContext.getBean(ObjectMapper::class.java)

        fun getRawPayload(typedProperties: Serializable): Map<String, Any> =
            objectMapper.convertValue(typedProperties, rawPropertiesTypeReference)
    }

    @Suppress("UNCHECKED_CAST")
    private val payloadClass: Class<TPayload> =
        (this.javaClass.genericSuperclass as ParameterizedType)
            .actualTypeArguments[0] as Class<TPayload>

    fun getTypedPayload(): TPayload = objectMapper.convertValue(payload, payloadClass)
}
