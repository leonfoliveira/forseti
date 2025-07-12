package io.github.leonfoliveira.judge.common.service.dto.input.contest

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class CreateContestInputDTOTest : FunSpec({
    context("MemberDTO#toString") {
        test("should mask password in toString") {
            val input = CreateContestInputDTO.MemberDTO(
                type = Member.Type.ROOT,
                name = "Test User",
                login = "testUser",
                password = "testPassword"
            )
            val expected = "MemberDTO(type=ROOT, name='Test User', login='testUser', password='******')"

            input.toString() shouldBe expected
        }
    }
})
