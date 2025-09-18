package io.github.leonfoliveira.judge.autojudge.listener

import io.github.leonfoliveira.judge.autojudge.event.SubmissionJudgedEvent
import io.github.leonfoliveira.judge.autojudge.feign.ApiClient
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.mockk
import io.mockk.verify

class SubmissionEventListenerTest :
    FunSpec({
        val apiClient = mockk<ApiClient>(relaxed = true)

        val sut = SubmissionEventListener(apiClient)

        test("should handle submission judged event") {
            val event = SubmissionJudgedEvent(this, SubmissionMockBuilder.build(), Submission.Answer.ACCEPTED)
            sut.onApplicationEvent(event)
            verify {
                apiClient.updateSubmissionAnswer(
                    event.submission.contest.id,
                    event.submission.id,
                    event.answer,
                )
            }
        }
    })
