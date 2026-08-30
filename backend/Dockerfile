# Build stage using Gradle
FROM gradle:8.8-jdk21 AS build
WORKDIR /app
COPY gradlew gradlew.bat build.gradle settings.gradle /app/
COPY gradle /app/gradle
COPY src /app/src
RUN gradle bootJar --no-daemon -x test

# Runtime stage with lightweight JDK
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
VOLUME /tmp
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
