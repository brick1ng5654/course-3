FROM maven:3.8-openjdk-11 AS builder
WORKDIR /app

COPY pom.xml .
COPY src ./src
RUN mvn clean package

FROM tomcat:9.0-jre11

RUN rm -rf /usr/local/tomcat/webapps/*

COPY --from=builder /app/target/lab5.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8081

CMD ["catalina.sh", "run"]