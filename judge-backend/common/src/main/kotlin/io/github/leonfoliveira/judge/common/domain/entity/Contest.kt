package io.github.leonfoliveira.judge.common.domain.entity

import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.SQLRestriction
import org.hibernate.annotations.Where
import org.hibernate.envers.Audited
import org.hibernate.type.SqlTypes
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "contest")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at is null")
class Contest(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    /**
     * A unique identifier for the contest, typically a slug that is used in URLs.
     */
    @Column(nullable = false, unique = true)
    var slug: String,
    /**
     * The title of the contest, which is displayed to participants.
     */
    @Column(nullable = false)
    var title: String,
    /**
     * The languages that are allowed for submissions in this contest.
     */
    @Column(nullable = false)
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Enumerated(EnumType.STRING)
    var languages: List<Language>,
    /**
     * The start time of the contest.
     */
    @Column(name = "start_at", nullable = false)
    var startAt: OffsetDateTime,
    /**
     * The end time of the contest.
     */
    @Column(name = "end_at", nullable = false)
    var endAt: OffsetDateTime,
    /**
     * Settings to control various aspects of the contest.
     */
    @Column(name = "settings", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    var settings: ContestSettings = ContestSettings(),
    /**
     * Members of the contest, which can include contestants, juries, and other participants.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var members: List<Member> = mutableListOf(),
    /**
     * The problems that are part of the contest, which participants will solve.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var problems: List<Problem> = mutableListOf(),
    /**
     * All clarifications for the contest, which contain questions and answers related to the contest problems.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @Where(clause = "parent_id is null")
    var clarifications: List<Clarification> = mutableListOf(),
    /**
     * Announcements related to the contest, which can include important updates or information for participants.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var announcements: List<Announcement> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt) {
    fun hasStarted(): Boolean = !startAt.isAfter(OffsetDateTime.now())

    fun isActive(): Boolean = hasStarted() && !hasFinished()

    fun hasFinished(): Boolean = !endAt.isAfter(OffsetDateTime.now())
}
