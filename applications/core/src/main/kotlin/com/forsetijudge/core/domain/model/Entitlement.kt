package com.forsetijudge.core.domain.model

import com.forsetijudge.core.domain.entity.Member

/**
 * A permission required to access an API path. Paths that require no entitlement are public.
 * Each [Member.Type] is granted a fixed set of entitlements, see [forType].
 */
enum class Entitlement {
    ANNOUNCEMENT_CREATE,

    ATTACHMENT_CREATE,

    CLARIFICATION_CREATE,
    CLARIFICATION_ANSWER,
    CLARIFICATION_PUBLISH,

    CONTEST_LIST,
    CONTEST_CREATE,
    CONTEST_UPDATE,
    CONTEST_DELETE,
    CONTEST_FORCE_START,
    CONTEST_FORCE_END,
    CONTEST_FREEZE,
    CONTEST_UNFREEZE,

    DASHBOARD_ADMIN_READ,
    DASHBOARD_JUDGE_READ,
    DASHBOARD_STAFF_READ,
    DASHBOARD_CONTESTANT_READ,

    PRINT_REQUEST_CREATE,
    PRINT_REQUEST_UPDATE_STATUS,

    SESSION_READ,
    SESSION_DELETE,

    SUBMISSION_CREATE,
    SUBMISSION_RESUBMIT,
    SUBMISSION_UPDATE_ANSWER,
    ;

    companion object {
        private val ENTITLEMENTS_BY_TYPE: Map<Member.Type, Set<Entitlement>> =
            mapOf(
                Member.Type.ROOT to
                    setOf(
                        ANNOUNCEMENT_CREATE,
                        ATTACHMENT_CREATE,
                        CLARIFICATION_ANSWER,
                        CLARIFICATION_PUBLISH,
                        CONTEST_LIST,
                        CONTEST_CREATE,
                        CONTEST_UPDATE,
                        CONTEST_DELETE,
                        CONTEST_FORCE_START,
                        CONTEST_FORCE_END,
                        CONTEST_FREEZE,
                        CONTEST_UNFREEZE,
                        DASHBOARD_ADMIN_READ,
                        PRINT_REQUEST_CREATE,
                        PRINT_REQUEST_UPDATE_STATUS,
                        SESSION_READ,
                        SESSION_DELETE,
                        SUBMISSION_RESUBMIT,
                        SUBMISSION_UPDATE_ANSWER,
                    ),
                Member.Type.ADMIN to
                    setOf(
                        ANNOUNCEMENT_CREATE,
                        ATTACHMENT_CREATE,
                        CLARIFICATION_ANSWER,
                        CLARIFICATION_PUBLISH,
                        CONTEST_UPDATE,
                        CONTEST_FORCE_START,
                        CONTEST_FORCE_END,
                        CONTEST_FREEZE,
                        CONTEST_UNFREEZE,
                        DASHBOARD_ADMIN_READ,
                        PRINT_REQUEST_CREATE,
                        PRINT_REQUEST_UPDATE_STATUS,
                        SESSION_READ,
                        SESSION_DELETE,
                        SUBMISSION_RESUBMIT,
                        SUBMISSION_UPDATE_ANSWER,
                    ),
                Member.Type.JUDGE to
                    setOf(
                        ATTACHMENT_CREATE,
                        CLARIFICATION_ANSWER,
                        CLARIFICATION_PUBLISH,
                        DASHBOARD_JUDGE_READ,
                        PRINT_REQUEST_CREATE,
                        PRINT_REQUEST_UPDATE_STATUS,
                        SESSION_READ,
                        SESSION_DELETE,
                        SUBMISSION_RESUBMIT,
                        SUBMISSION_UPDATE_ANSWER,
                    ),
                Member.Type.STAFF to
                    setOf(
                        ATTACHMENT_CREATE,
                        DASHBOARD_STAFF_READ,
                        PRINT_REQUEST_CREATE,
                        PRINT_REQUEST_UPDATE_STATUS,
                        SESSION_READ,
                        SESSION_DELETE,
                    ),
                Member.Type.CONTESTANT to
                    setOf(
                        ATTACHMENT_CREATE,
                        CLARIFICATION_CREATE,
                        DASHBOARD_CONTESTANT_READ,
                        PRINT_REQUEST_CREATE,
                        SESSION_READ,
                        SESSION_DELETE,
                        SUBMISSION_CREATE,
                    ),
                Member.Type.UNOFFICIAL_CONTESTANT to
                    setOf(
                        ATTACHMENT_CREATE,
                        CLARIFICATION_CREATE,
                        DASHBOARD_CONTESTANT_READ,
                        PRINT_REQUEST_CREATE,
                        SESSION_READ,
                        SESSION_DELETE,
                        SUBMISSION_CREATE,
                    ),
            )

        fun forType(type: Member.Type): Set<Entitlement> = ENTITLEMENTS_BY_TYPE.getValue(type)
    }
}
