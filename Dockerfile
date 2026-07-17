FROM debian:bookworm-slim

# Install dependencies required for MPL interpreter
RUN apt-get update && apt-get install -y \
    flex \
    bison \
    make \
    g++ \
    libreadline-dev \
    valgrind \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the project files
COPY . /app

# By default, open a bash shell so the user can run make, make run, or make mpl
CMD ["/bin/bash"]
