package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.util.IdGenerator
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.OffsetDateTime
import java.util.UUID
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited

@Entity
@Table(name = "print_request")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at IS NULL")
class PrintRequest(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    /**
     * The submission associated with this print request.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    @Audited(withModifiedFlag = false)
    val submission: Submission,
    /**
     * The status of the print request.
     */
    @Column("status", nullable = false)
    var status: Status = Status.PENDING,
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
    enum class Status {
        /**
         * The print request is pending and has not been processed yet.
         */
        PENDING,

        /**
         * The print request has been completed successfully.
         */
        COMPLETED,

        /**
         * The print request has been refused and will not be processed.
         */
        REFUSED,
    }
}
