package com.forsetijudge.core.domain.entity

import com.github.f4b6a3.uuid.UuidCreator
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.OneToMany
import jakarta.persistence.OrderBy
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
    id: UUID = UuidCreator.getTimeOrderedEpoch(),
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
    var languages: List<Submission.Language>,
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
     * The time when the leaderboard will be automatically frozen.
     */
    @Column(name = "auto_freeze_at")
    var autoFreezeAt: OffsetDateTime? = null,
    /**
     * The time when the leaderboard has been frozen.
     */
    @Column(name = "frozen_at")
    var frozenAt: OffsetDateTime? = null,
    /**
     * Settings to control various aspects of the contest.
     */
    @Column(name = "settings", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    var settings: Settings = Settings(),
    /**
     * Members of the contest, which can include contestants, juries, and other participants.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("createdAt ASC")
    var members: List<Member> = mutableListOf(),
    /**
     * The problems that are part of the contest, which participants will solve.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("letter ASC")
    var problems: List<Problem> = mutableListOf(),
    /**
     * All clarifications for the contest, which contain questions and answers related to the contest problems.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @Where(clause = "parent_id is null")
    @OrderBy("createdAt ASC")
    var clarifications: List<Clarification> = mutableListOf(),
    /**
     * Announcements related to the contest, which can include important updates or information for participants.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("createdAt ASC")
    var announcements: List<Announcement> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt) {
    fun hasStarted(): Boolean = !startAt.isAfter(OffsetDateTime.now())

    fun hasFinished(): Boolean = !endAt.isAfter(OffsetDateTime.now())

    fun isActive(): Boolean = hasStarted() && !hasFinished()

    val isFrozen: Boolean
        get() = frozenAt != null && !frozenAt!!.isAfter(OffsetDateTime.now())

    data class Settings(
        var isAutoJudgeEnabled: Boolean = true,
    )
}
