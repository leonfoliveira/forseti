package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.util.CsrfCookieBuilder
import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.domain.model.Session
import com.forsetijudge.core.port.input.usecase.session.DeleteAllSessionsByContextMemberUseCase
import com.forsetijudge.core.test.factory.MockModelFactory
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpHeaders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.context.SecurityContext
import com.forsetijudge.core.domain.model.SessionAuthentication

class SessionControllerTest {
    private val deleteSessions = mock<DeleteAllSessionsByContextMemberUseCase>()
    private val sessionCookies = mock<SessionCookieBuilder>()
    private val csrfCookies = mock<CsrfCookieBuilder>()
    private val mvc = MockMvcTestSupport.mvc(SessionController(deleteSessions, sessionCookies, csrfCookies))

    @AfterEach
    fun clearAuthentication() = TestAuthentication.clear()

    @Test
    fun `returns current authenticated session`() {
        val session = MockModelFactory.session()
        SecurityContextHolder.getContext().authentication = SessionAuthentication(session, "127.0.0.1")

        mvc.perform(get("/v1/sessions/me"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(session.id.toString()))
            .andExpect(jsonPath("$.member.id").value(session.member.id.toString()))
    }

    @Test
    fun `deletes current sessions and clears both cookies`() {
        whenever(sessionCookies.buildCleanCookie()).thenReturn("session_id=; Max-Age=0")
        whenever(csrfCookies.buildCleanCookie()).thenReturn("csrf_token=; Max-Age=0")

        mvc.perform(delete("/v1/sessions/me"))
            .andExpect(status().isNoContent)
            .andExpect(header().stringValues(HttpHeaders.SET_COOKIE, "session_id=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT", "csrf_token=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"))

        verify(deleteSessions).execute()
        verify(sessionCookies).buildCleanCookie()
        verify(csrfCookies).buildCleanCookie()
    }
}
