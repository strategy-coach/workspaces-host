function setup-java-amazon-corretto
    # Ensure directories exist
    mkdir -p $HOME/.local/lib/java
    mkdir -p $HOME/.local/bin

    # Install Amazon Corretto
    set CORRETTO_URL https://corretto.aws/downloads/latest/amazon-corretto-21-x64-linux-jdk.tar.gz
    curl -fsSL $CORRETTO_URL | tar -xz -C $HOME/.local/lib/java
    set CORRETTO_DIR (basename $CORRETTO_URL | sed 's/.tar.gz//')
    ln -sfn $HOME/.local/lib/java/$CORRETTO_DIR/bin/java $HOME/.local/bin/java
    ln -sfn $HOME/.local/lib/java/$CORRETTO_DIR/bin/javac $HOME/.local/bin/javac

    # Determine Maven version
    if not set -q MAVEN_VERSION
        set MAVEN_VERSION (curl -s https://maven.apache.org/download.cgi | grep -oP 'apache-maven-\K[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)
    end

    # Install Maven
    set MAVEN_URL https://downloads.apache.org/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.tar.gz
    curl -fsSL $MAVEN_URL | tar -xz -C $HOME/.local/lib/java

    # Add Corretto and Maven to Fish PATH
    set -U fish_user_paths $HOME/.local/lib/java/$CORRETTO_DIR/bin $HOME/.local/lib/java/apache-maven-$MAVEN_VERSION/bin $fish_user_paths

    echo "$CORRETTO_DIR and apache-maven-$MAVEN_VERSION have been installed."
    echo "Their paths have been added to fish_user_paths."
end