package com.phegondev.Phegon.Eccormerce.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
@Slf4j
public class AwsS3Service {

    private final String bucketName = "phegon-ecommerce";

    @Value("${aws.s3.access}")
    private String awsS3AccessKey;

    @Value("${aws.s3.secret}")
    private String awsS3SecretKey;

    private AmazonS3 s3Client;

    @PostConstruct
    public void init() {
        BasicAWSCredentials awsCredentials = new BasicAWSCredentials(awsS3AccessKey, awsS3SecretKey);
        this.s3Client = AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                .withRegion(Regions.US_EAST_2)
                .build();
    }

    public String saveImageToS3(MultipartFile photo) {
        try {
            String extension = photo.getOriginalFilename().substring(photo.getOriginalFilename().lastIndexOf("."));
            String s3FileName = UUID.randomUUID().toString() + extension;

            InputStream inputStream = photo.getInputStream();
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(photo.getContentType());

            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, s3FileName, inputStream, metadata);
            s3Client.putObject(putObjectRequest);

            log.info("Successfully uploaded file {} to bucket {}", s3FileName, bucketName);
            return "https://" + bucketName + ".s3.us-east-2.amazonaws.com/" + s3FileName;

        } catch (IOException e) {
            log.error("Failed to upload image to S3: {}", e.getMessage());
            throw new RuntimeException("Unable to upload image to S3 bucket.", e);
        }
    }
}
