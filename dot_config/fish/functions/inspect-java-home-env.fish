function inspect-java-home-env
    set java_paths (find $HOME/.local/lib/java -type f -name java)

    if test (count $java_paths) -eq 0
        echo "No Java installations found in ~/.local/lib/java"
        return 1
    end

    set latest_java_dir (dirname (dirname (echo $java_paths | sort -V | tail -n 1)))

    echo "use the following to set your Java Home:"
    echo "  export JAVA_HOME=$latest_java_dir"
end
