# Build stage
FROM maven:3.8.8-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to cache them in the Docker layer
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Run stage
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/portfolio-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
