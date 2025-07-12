package io.github.leonfoliveira.judge.common.service.dto.input.contest

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class UpdateContestInputDTOTest : FunSpec({
    context("MemberDTO#toString") {
        test("should mask password") {
            val input = UpdateContestInputDTO.MemberDTO(
                id = null,
                type = Member.Type.ROOT,
                name = "Test User",
                login = "testUser",
                password = "testPassword"
            )
            val expected = "MemberDTO(id=null, type=ROOT, name='Test User', login='testUser', password='******')"

            input.toString() shouldBe expected
        }
    }
})
