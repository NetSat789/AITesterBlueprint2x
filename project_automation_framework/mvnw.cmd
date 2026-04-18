@echo off
setlocal
set START_DIR=%~dp0
set WRAPPER_JAR="%START_DIR%.mvn\wrapper\maven-wrapper.jar"
if not exist %WRAPPER_JAR% (
    echo Error: %WRAPPER_JAR% not found.
    exit /b 1
)
java -Dmaven.multiModuleProjectDirectory=%START_DIR% -cp %WRAPPER_JAR% org.apache.maven.wrapper.MavenWrapperMain %*
