package com.forsetijudge.core.domain.entity

import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class ContestTest {
    private val now = OffsetDateTime.now()

    @Test
    fun `should create a contest with valid parameters`() {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val contest =
                Contest(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.JAVA_21),
                    startAt = now,
                    endAt = now.plusHours(2),
                    autoFreezeAt = now.plusHours(1),
                    ipCIDRs = listOf("0.0.0.0/0"),
                    settings =
                        Contest.Settings(
                            isAutoJudgeEnabled = true,
                            isClarificationEnabled = true,
                            isPrintRequestEnabled = true,
                            isSpectatorEnabled = true,
                        ),
                )

            assertNotNull(contest.id)
            assertEquals(now, contest.createdAt)
            assertEquals(now, contest.updatedAt)
            assertNull(contest.deletedAt)
            assertEquals(1L, contest.version)
            assertEquals("test-contest", contest.slug)
            assertEquals("Test Contest", contest.title)
            assertEquals(listOf(Submission.Language.JAVA_21), contest.languages)
            assertEquals(now, contest.startAt)
            assertEquals(now.plusHours(2), contest.endAt)
            assertEquals(now.plusHours(1), contest.autoFreezeAt)
            assertEquals(listOf("0.0.0.0/0"), contest.ipCIDRs)
            assertEquals(
                Contest.Settings(
                    isAutoJudgeEnabled = true,
                    isClarificationEnabled = true,
                    isPrintRequestEnabled = true,
                    isSpectatorEnabled = true,
                ),
                contest.settings,
            )
        }
    }

    @ParameterizedTest
    @CsvSource(
        "JAVA_21, true",
        "CPP_17, false",
    )
    fun `should return correct value for hasLanguage`(
        language: Submission.Language,
        expected: Boolean,
    ) {
        val contest =
            Contest(
                slug = "test-contest",
                title = "Test Contest",
                languages = listOf(Submission.Language.JAVA_21),
                startAt = now,
                endAt = now.plusHours(2),
            )

        assertEquals(expected, contest.hasLanguage(language))
    }

    @ParameterizedTest
    @CsvSource(
        "2024-01-01T10:00:00Z, 2024-01-01T12:00:00Z, 2024-01-01T11:00:00Z, true",
        "2024-01-01T10:00:00Z, 2024-01-01T12:00:00Z, 2024-01-01T09:00:00Z, false",
    )
    fun `should return correct value for hasStarted`(
        startAt: OffsetDateTime,
        endAt: OffsetDateTime,
        currentTime: OffsetDateTime,
        expected: Boolean,
    ) {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(currentTime)

            val contest =
                Contest(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.JAVA_21),
                    startAt = startAt,
                    endAt = endAt,
                )

            assertEquals(expected, contest.hasStarted())
        }
    }

    @ParameterizedTest
    @CsvSource(
        "2024-01-01T10:00:00Z, 2024-01-01T12:00:00Z, 2024-01-01T11:00:00Z, false",
        "2024-01-01T10:00:00Z, 2024-01-01T12:00:00Z, 2024-01-01T09:00:00Z, false",
        "2024-01-01T10:00:00Z, 2024-01-01T12:00:00Z, 2024-01-01T13:00:00Z, true",
    )
    fun `should return correct value for hasEnded`(
        startAt: OffsetDateTime,
        endAt: OffsetDateTime,
        currentTime: OffsetDateTime,
        expected: Boolean,
    ) {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(currentTime)

            val contest =
                Contest(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.JAVA_21),
                    startAt = startAt,
                    endAt = endAt,
                )

            assertEquals(expected, contest.hasEnded())
        }
    }

    @ParameterizedTest
    @CsvSource(
        "2024-01-01T10:00:00Z, 2024-01-01T12:00:00Z, 2024-01-01T11:00:00Z, true",
        "2024-01-01T10:00:00Z, 2024-01-01T12:00:00Z, 2024-01-01T09:00:00Z, false",
        "2024-01-01T10:00:00Z, 2024-01-01T12:00:00Z, 2024-01-01T13:00:00Z, false",
    )
    fun `should return correct value for isActive`(
        startAt: OffsetDateTime,
        endAt: OffsetDateTime,
        currentTime: OffsetDateTime,
        expected: Boolean,
    ) {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(currentTime)

            val contest =
                Contest(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.JAVA_21),
                    startAt = startAt,
                    endAt = endAt,
                )

            assertEquals(expected, contest.isActive())
        }
    }

    @ParameterizedTest
    @CsvSource(
        "2024-01-01T10:00:00Z, 2024-01-01T12:00:00Z, 2024-01-01T09:00:00Z, false",
        "2024-01-01T10:00:00Z, 2024-01-01T12:00:00Z, 2024-01-01T13:00:00Z, false",
    )
    fun `should return correct value for isFrozen`(
        startAt: OffsetDateTime,
        endAt: OffsetDateTime,
        currentTime: OffsetDateTime,
        expected: Boolean,
    ) {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(currentTime)

            val contest =
                Contest(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.JAVA_21),
                    startAt = startAt,
                    endAt = endAt,
                )

            assertEquals(expected, contest.isFrozen())
        }
    }
}
