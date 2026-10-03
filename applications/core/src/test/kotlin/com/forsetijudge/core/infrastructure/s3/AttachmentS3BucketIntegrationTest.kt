package com.forsetijudge.core.infrastructure.s3

import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.testcontainer.TestContainerLocalStack
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

class AttachmentS3BucketIntegrationTest : TestContainerLocalStack() {
    private val bucketName = "test-bucket"
    private val bucket = AttachmentS3Bucket(s3Presigner, s3Client, bucketName, 600, 600)
    private val http = HttpClient.newHttpClient()

    @BeforeEach
    fun createBucket() {
        if (s3Client.listBuckets().buckets().none { it.name() == bucketName }) {
            s3Client.createBucket { it.bucket(bucketName) }
        }
    }

    @Test
    fun `uploads and downloads an attachment`() {
        val attachment = MockEntityFactory.attachment()
        val data = "hello world".toByteArray()

        bucket.upload(attachment, data)

        assertArrayEquals(data, bucket.download(attachment))
    }

    @Test
    fun `signed upload url accepts content and signed download url serves it`() {
        val attachment = MockEntityFactory.attachment()
        val data = "signed content".toByteArray()

        val uploadRequest =
            HttpRequest
                .newBuilder(URI.create(bucket.getUploadUrl(attachment)))
                .header("Content-Type", attachment.contentType)
                .PUT(HttpRequest.BodyPublishers.ofByteArray(data))
                .build()
        assertEquals(200, http.send(uploadRequest, HttpResponse.BodyHandlers.discarding()).statusCode())

        val downloadRequest = HttpRequest.newBuilder(URI.create(bucket.getDownloadUrl(attachment))).GET().build()
        val response = http.send(downloadRequest, HttpResponse.BodyHandlers.ofByteArray())

        assertEquals(200, response.statusCode())
        assertArrayEquals(data, response.body())
    }
}
