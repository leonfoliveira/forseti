package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.OrderBy
import jakarta.persistence.Table
import org.hibernate.annotations.SQLRestriction
import org.hibernate.envers.Audited
import org.hibernate.envers.NotAudited
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "member")
@Audited(withModifiedFlag = true)
@SQLRestriction("deleted_at IS NULL")
class Member(
    id: UUID = IdGenerator.getUUID(),
    createdAt: OffsetDateTime = ExecutionContext.get().startedAt,
    updatedAt: OffsetDateTime = ExecutionContext.get().startedAt,
    deletedAt: OffsetDateTime? = null,
    version: Long = 1L,
    /**
     * The contest to which this member belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id")
    @Audited(withModifiedFlag = false)
    val contest: Contest? = null,
    /**
     * The type of the member.
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var type: Type,
    /**
     * The name of the member, which can be a person name or a team name.
     */
    @Column(nullable = false)
    var name: String,
    /**
     * The login identifier for the member, which is unique within the contest.
     */
    @Column(nullable = false)
    var login: String,
    /**
     * The password for the member, which is used for authentication.
     */
    @Column(nullable = false)
    var password: String,
    /**
     * The submissions made by this member in the contest.
     */
    @Audited(withModifiedFlag = false)
    @OneToMany(mappedBy = "member", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @OrderBy("createdAt ASC")
    var submissions: List<Submission> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deletedAt, version) {
    enum class Type {
        /**
         * Represents a system-level member used for API interactions.
         */
        API,

        /**
         * Represents a system-level member used for automatic judging of submissions.
         */
        AUTOJUDGE,

        /**
         * Represents a member who can create contests and has administrative privileges within all contests.
         */
        ROOT,

        /**
         * Represents a member with administrative privileges within the contest, such as contest managers.
         */
        ADMIN,

        /**
         * Represents a member who is part of the staff, responsible for assisting contestants.
         */
        STAFF,

        /**
         * Represents a member who is part of the jury, responsible for judging submissions.
         */
        JUDGE,

        /**
         * Represents a member who participates in the contest, such as a contestant.
         */
        CONTESTANT,
    }

    companion object {
        val ROOT_ID: UUID = UUID.fromString("00000000-0000-0000-0000-000000000000")
        const val ROOT_NAME = "Root"
        const val ROOT_LOGIN = "root"

        val API_ID: UUID = UUID.fromString("11111111-1111-1111-1111-111111111111")
        const val API_NAME = "Api"
        const val API_LOGIN = "api"

        val AUTOJUDGE_ID: UUID = UUID.fromString("22222222-2222-2222-2222-222222222222")
        const val AUTOJUDGE_NAME = "Autojudge"
        const val AUTOJUDGE_LOGIN = "autojudge"
    }
}
