# Etapa 1: compilar (dependências em camada própria para aproveitar cache)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

# Etapa 2: executar com JRE, usuário sem privilégios
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 10001 antigolpe
COPY --from=build /app/target/antigolpe-0.0.1-SNAPSHOT.jar app.jar
USER antigolpe

# O Render define $PORT; o application.properties já lê server.port=${PORT:8080}
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
