package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.util.IdGenerator
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.OneToMany
import jakarta.persistence.OrderBy
import jakarta.persistence.Table
import java.time.OffsetDateTime
import java.util.UUID
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited

@Entity
@Table(name = "contest")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at IS NULL")
class Contest(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
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
    @Column(name = "languages")
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
     * The time when the contest will automatically freeze, hiding submissions updates.
     */
    @Column(name = "auto_freeze_at")
    var autoFreezeAt: OffsetDateTime? = null,
    /**
     * The time when the contest was frozen.
     */
    @Column(name = "frozen_at", nullable = false)
    var frozenAt: OffsetDateTime? = null,
    /**
     * The IP CIDRs that are allowed to access the contest.
     */
    @Column(name = "ip_cidrs", nullable = false)
    @Audited(modifiedColumnName = "ip_cidrs_mod")
    var ipCIDRs: List<String> = mutableListOf(),
    /**
     * The settings for the contest, which include various configuration options.
     */
    @Embedded
    @Audited(withModifiedFlag = false)
    var settings: Settings = Settings(),
    /**
     * The members of the contest, which can include contestants, judges, and other roles.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("createdAt ASC")
    var members: List<Member> = mutableListOf(),
    /**
     * The problems that are part of the contest, which contestants will solve.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("letter ASC")
    var problems: List<Problem> = mutableListOf(),
    /**
     * Announcements related to the contest, which can include important updates or information for contestants.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("createdAt ASC")
    var announcements: List<Announcement> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
    @Embeddable
    data class Settings(
        // Whether the auto-judge system is enabled for this contest, allowing for automatic evaluation of submissions.
        @Column(name = "is_auto_judge_enabled", nullable = false)
        var isAutoJudgeEnabled: Boolean = true,
        // Whether members can ask for clarifications during the contest.
        @Column(name = "is_clarification_enabled", nullable = false)
        var isClarificationEnabled: Boolean = true,
        // Whether members can request a printout of a submission code.
        @Column(name = "is_print_request_enabled", nullable = false)
        var isPrintRequestEnabled: Boolean = true,
        // Whether spectators are allowed to view the contest and its problems without logging in.
        @Column(name = "is_spectator_enabled", nullable = false)
        var isSpectatorEnabled: Boolean = true,
    )

    fun hasLanguage(language: Submission.Language): Boolean = languages.contains(language)

    fun hasStarted(): Boolean = !startAt.isAfter(OffsetDateTime.now())

    fun hasEnded(): Boolean = !endAt.isAfter(OffsetDateTime.now())

    fun isActive(): Boolean {
        val currentStartAt = startAt
        val currentEndAt = endAt
        val now = OffsetDateTime.now()
        return !currentStartAt.isAfter(now) && !currentEndAt.isBefore(now)
    }

    fun isFrozen(): Boolean {
        val currentFrozenAt = frozenAt
        return currentFrozenAt != null && !currentFrozenAt.isAfter(OffsetDateTime.now())
    }
}
