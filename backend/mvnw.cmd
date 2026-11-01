@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

if exist "C:\Users\goura\.m2\apache-maven-3.9.9\bin\mvn.cmd" (
    "C:\Users\goura\.m2\apache-maven-3.9.9\bin\mvn.cmd" %*
) else (
    mvn %*
)
