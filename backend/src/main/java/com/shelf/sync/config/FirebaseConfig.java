package com.shelf.sync.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${app.firebase.project-id:shelfsync-demo}")
    private String projectId;

    @Value("${app.firebase.credentials-path:}")
    private String credentialsPath;

    @PostConstruct
    public void initFirebase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            logger.info("FirebaseApp already initialized.");
            return;
        }

        try {
            FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder();
            boolean credentialsFound = false;

            // 1. Check explicit credentials path from config / env
            if (credentialsPath != null && !credentialsPath.trim().isEmpty()) {
                File file = new File(credentialsPath.trim());
                if (file.exists()) {
                    try (InputStream serviceAccount = new FileInputStream(file)) {
                        optionsBuilder.setCredentials(GoogleCredentials.fromStream(serviceAccount));
                        credentialsFound = true;
                        logger.info("Initialized Firebase using credentials file at: {}", credentialsPath);
                    }
                }
            }

            // 2. Check classpath for firebase-service-account.json
            if (!credentialsFound) {
                InputStream classpathStream = getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");
                if (classpathStream != null) {
                    optionsBuilder.setCredentials(GoogleCredentials.fromStream(classpathStream));
                    credentialsFound = true;
                    logger.info("Initialized Firebase using classpath resource: firebase-service-account.json");
                }
            }

            // 3. Fallback to Google Application Default Credentials or Project ID options
            if (!credentialsFound) {
                try {
                    optionsBuilder.setCredentials(GoogleCredentials.getApplicationDefault());
                    credentialsFound = true;
                    logger.info("Initialized Firebase using Google Application Default Credentials (ADC).");
                } catch (Exception e) {
                    logger.warn("No Google Application Default Credentials found. Using mock/project-id fallback for local development: {}", projectId);
                    optionsBuilder.setProjectId(projectId);
                    optionsBuilder.setCredentials(GoogleCredentials.create(new com.google.auth.oauth2.AccessToken("mock-token", new java.util.Date(System.currentTimeMillis() + 3600000))));
                }
            }

            optionsBuilder.setProjectId(projectId);
            FirebaseApp.initializeApp(optionsBuilder.build());
            logger.info("FirebaseApp initialized successfully for project: {}", projectId);
        } catch (Exception e) {
            logger.error("Error initializing FirebaseApp: {}", e.getMessage(), e);
        }
    }
}
