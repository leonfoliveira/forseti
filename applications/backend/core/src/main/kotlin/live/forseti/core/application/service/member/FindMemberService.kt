package live.forseti.core.application.service.member

import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.repository.MemberRepository
import live.forseti.core.port.driving.usecase.member.FindMemberUseCase
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class FindMemberService(
    private val memberRepository: MemberRepository,
) : FindMemberUseCase {
    override fun findById(id: UUID) =
        memberRepository.findEntityById(id)
            ?: throw NotFoundException("Could not find member with id = $id")
}
