package com.forsetijudge.core.domain.entity

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.persistence.Column
import jakarta.persistence.DiscriminatorColumn
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import org.hibernate.envers.NotAudited
import org.hibernate.type.SqlTypes
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "ticket")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type")
@Audited
@SQLRestriction("deleted_at IS NULL")
open class Ticket<TProperties : Serializable>(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
    updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    /**
     * The contest to which this ticket belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    open val contest: Contest,
    /**
     * The member who made this ticket.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    open val member: Member,
    /**
     * The staff who is responsible for handling this ticket. It is null if the ticket has not been handled yet.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    open var staff: Member? = null,
    /**
     * The type of the ticket.
     */
    @Column(name = "type", nullable = false, insertable = false, updatable = false)
    @Enumerated(EnumType.STRING)
    open var type: Type,
    /**
     * The status of the ticket.
     */
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    open var status: Status = Status.OPEN,
    /**
     * The properties of the ticket, which is a JSON object containing additional information about the ticket.
     * The structure of the properties depends on the type of the ticket.
     */
    @Column(name = "properties", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Audited(withModifiedFlag = false)
    open var properties: Map<String, Any>,
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
    @Column(name = "contest_id", insertable = false, updatable = false)
    @NotAudited
    open lateinit var contestId: UUID

    @Column(name = "member_id", insertable = false, updatable = false)
    @NotAudited
    open lateinit var memberId: UUID

    @Column(name = "staff_id", insertable = false, updatable = false)
    @NotAudited
    open var staffId: UUID? = null

    enum class Type {
        SUBMISSION_PRINT,
        TECHNICAL_SUPPORT,
        NON_TECHNICAL_SUPPORT,
    }

    enum class Status {
        OPEN,
        IN_PROGRESS,
        RESOLVED,
        REJECTED,
    }

    companion object {
        private val rawPropertiesTypeReference = object : TypeReference<Map<String, Any>>() {}

        fun getRawProperties(
            objectMapper: ObjectMapper,
            typedProperties: Serializable,
        ): Map<String, Any> = objectMapper.convertValue(typedProperties, rawPropertiesTypeReference)
    }
}
