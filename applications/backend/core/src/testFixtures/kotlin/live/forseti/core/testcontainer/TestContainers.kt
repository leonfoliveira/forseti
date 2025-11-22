package live.forseti.core.testcontainer

import org.springframework.context.annotation.Import

@Import(MinioTestContainer::class, PostgresTestContainer::class, RabbitMQTestContainer::class)
class TestContainers
