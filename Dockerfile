#########
# TOOLS #
#########

# Use node as the base image
FROM node:26.12.0-trixie as tools

# Environment variables
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Build time variables
ARG DEBIAN_FRONTEND=noninteractive

RUN set -e && \
    # Update and install system dependencies
    apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
    git wget curl zip unzip p7zip-full tree ripgrep python3 python3-pip && \
    rm -rf /var/lib/apt/lists/* && \
    # Git config
    git config --system --add safe.directory '*'

WORKDIR /workspaces/vdl-plugin-template

################
# DEVCONTAINER #
################

FROM tools AS devcontainer

CMD ["sleep", "infinity"]
