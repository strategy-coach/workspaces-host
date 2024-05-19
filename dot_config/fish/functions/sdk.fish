# reference: https://github.com/sdkman/sdkman-cli/issues/671
function sdk
    bash -c "source '$HOME/.sdkman/bin/sdkman-init.sh'; sdk $argv[1..]"
end