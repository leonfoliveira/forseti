package com.forsetijudge.core.domain.model

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.Entitlement.ANNOUNCEMENT_CREATE
import com.forsetijudge.core.domain.model.Entitlement.ATTACHMENT_CREATE
import com.forsetijudge.core.domain.model.Entitlement.CLARIFICATION_ANSWER
import com.forsetijudge.core.domain.model.Entitlement.CLARIFICATION_CREATE
import com.forsetijudge.core.domain.model.Entitlement.CLARIFICATION_PUBLISH
import com.forsetijudge.core.domain.model.Entitlement.CONTEST_CREATE
import com.forsetijudge.core.domain.model.Entitlement.CONTEST_DELETE
import com.forsetijudge.core.domain.model.Entitlement.CONTEST_FORCE_END
import com.forsetijudge.core.domain.model.Entitlement.CONTEST_FORCE_START
import com.forsetijudge.core.domain.model.Entitlement.CONTEST_FREEZE
import com.forsetijudge.core.domain.model.Entitlement.CONTEST_LIST
import com.forsetijudge.core.domain.model.Entitlement.CONTEST_UNFREEZE
import com.forsetijudge.core.domain.model.Entitlement.CONTEST_UPDATE
import com.forsetijudge.core.domain.model.Entitlement.DASHBOARD_ADMIN_READ
import com.forsetijudge.core.domain.model.Entitlement.DASHBOARD_CONTESTANT_READ
import com.forsetijudge.core.domain.model.Entitlement.DASHBOARD_JUDGE_READ
import com.forsetijudge.core.domain.model.Entitlement.DASHBOARD_STAFF_READ
import com.forsetijudge.core.domain.model.Entitlement.PRINT_REQUEST_CREATE
import com.forsetijudge.core.domain.model.Entitlement.PRINT_REQUEST_UPDATE_STATUS
import com.forsetijudge.core.domain.model.Entitlement.SESSION_DELETE
import com.forsetijudge.core.domain.model.Entitlement.SESSION_READ
import com.forsetijudge.core.domain.model.Entitlement.SUBMISSION_CREATE
import com.forsetijudge.core.domain.model.Entitlement.SUBMISSION_RESUBMIT
import com.forsetijudge.core.domain.model.Entitlement.SUBMISSION_UPDATE_ANSWER
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class EntitlementTest {
    @Test
    fun `should have entitlements for ROOT`() {
        val rootEntitlements = Entitlement.forType(Member.Type.ROOT)
        assertEquals(
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
            rootEntitlements,
        )
    }

    @Test
    fun `should have entitlements for ADMIN`() {
        val adminEntitlements = Entitlement.forType(Member.Type.ADMIN)
        assertEquals(
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
            adminEntitlements,
        )
    }

    @Test
    fun `should have entitlements for JUDGE`() {
        val judgeEntitlements = Entitlement.forType(Member.Type.JUDGE)
        assertEquals(
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
            judgeEntitlements,
        )
    }

    @Test
    fun `should have entitlements for STAFF`() {
        val staffEntitlements = Entitlement.forType(Member.Type.STAFF)
        assertEquals(
            setOf(
                ATTACHMENT_CREATE,
                DASHBOARD_STAFF_READ,
                PRINT_REQUEST_CREATE,
                PRINT_REQUEST_UPDATE_STATUS,
                SESSION_READ,
                SESSION_DELETE,
            ),
            staffEntitlements,
        )
    }

    @Test
    fun `should have entitlements for CONTESTANT`() {
        val contestantEntitlements = Entitlement.forType(Member.Type.CONTESTANT)
        assertEquals(
            setOf(
                ATTACHMENT_CREATE,
                CLARIFICATION_CREATE,
                DASHBOARD_CONTESTANT_READ,
                PRINT_REQUEST_CREATE,
                SESSION_READ,
                SESSION_DELETE,
                SUBMISSION_CREATE,
            ),
            contestantEntitlements,
        )
    }

    @Test
    fun `should have entitlements for UNOFFICIAL_CONTESTANT`() {
        val unofficialContestantEntitlements = Entitlement.forType(Member.Type.UNOFFICIAL_CONTESTANT)
        assertEquals(
            setOf(
                ATTACHMENT_CREATE,
                CLARIFICATION_CREATE,
                DASHBOARD_CONTESTANT_READ,
                PRINT_REQUEST_CREATE,
                SESSION_READ,
                SESSION_DELETE,
                SUBMISSION_CREATE,
            ),
            unofficialContestantEntitlements,
        )
    }
}
