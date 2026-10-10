package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.util.IdGenerator
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
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
     * Announcements related to the contest, which can include important updates or information for participants.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("createdAt ASC")
    var announcements: List<Announcement> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
    fun hasLanguage(language: Submission.Language): Boolean = languages.contains(language)

    fun hasStarted(): Boolean = !startAt.isAfter(OffsetDateTime.now())

    fun hasEnded(): Boolean = !endAt.isAfter(OffsetDateTime.now())

    fun isActive(): Boolean = hasStarted() && !hasEnded()
}
