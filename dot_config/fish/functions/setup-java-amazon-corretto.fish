function setup-java-amazon-corretto
    sdk install java 21.0.3-amzn
    sdk default java 21.0.3-amzn
    fish_add_path (find "$HOME/.sdkman/candidates/java/current/bin" -maxdepth 0)

    sdk install maven 3.9.6
    sdk default maven 3.9.6
    fish_add_path (find "$HOME/.sdkman/candidates/maven/current/bin" -maxdepth 0)

    # TODO:
    #sdk install kolin latest
    #fish_add_path (find "$HOME/.sdkman/candidates/kotlin/current/bin" -maxdepth 0)
end