package com.forsetijudge.core.domain.entity

import com.github.f4b6a3.uuid.UuidCreator
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
import org.hibernate.type.SqlTypes
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "ticket")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type")
@Audited
@SQLRestriction("deleted_at is null")
open class Ticket<TProperties : Serializable>(
    id: UUID = UuidCreator.getTimeOrderedEpoch(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    /**
     * The contest to which this ticket belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val contest: Contest,
    /**
     * The member who made this ticket.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @Audited(withModifiedFlag = false)
    val member: Member,
    /**
     * The staff who is responsible for handling this ticket. It is null if the ticket has not been handled yet.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    @JoinColumn
    val staff: Member? = null,
    /**
     * The type of the ticket.
     */
    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    var type: Type,
    /**
     * The status of the ticket.
     */
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    var status: Status = Status.OPEN,
    /**
     * The properties of the ticket, which is a JSON object containing additional information about the ticket.
     * The structure of the properties depends on the type of the ticket.
     */
    @Column(name = "properties", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Audited(withModifiedFlag = false)
    var properties: TProperties,
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
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
}
