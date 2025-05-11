package io.leonfoliveira.judge.core.entity

import io.leonfoliveira.judge.core.util.TimeUtils
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.hibernate.envers.Audited
import java.time.LocalDateTime

@Entity
@Table(name = "member")
@Audited
class Member(
    id: Int = 0,
    createdAt: LocalDateTime = TimeUtils.now(),
    updatedAt: LocalDateTime = TimeUtils.now(),
    deleted: LocalDateTime? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    val contest: Contest,
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var type: Type,
    @Column(nullable = false)
    var name: String,
    @Column(nullable = false)
    var login: String,
    @Column(nullable = false)
    var password: String,
    @OneToMany(mappedBy = "member", fetch = FetchType.LAZY)
    var submissions: List<Submission> = mutableListOf(),
) : BaseEntity(id, createdAt, updatedAt, deleted) {
    enum class Type {
        ROOT,
        CONTESTANT,
    }
}
