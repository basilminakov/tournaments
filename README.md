# Description

A demo application for processing a different kinds of points-based tournaments.

# How to install

1. Install Docker-ce from the [**Docker official site**](https://www.docker.com/).
2. Install docker-compose.
3. Run "docker-compose up" in the root folder of the application (you should be logged in [**Docker hub**](https://hub.docker.com/)).

The app is installed and started!

# Some notes about application behaviour.

1. You should wait for some time in order to allow the MySQL server to start.
2. You are able to send the commands for the server using address of Docker machine (or localhost if Docker installed locally) with the port 3000 (by default).

# IMPORTANT NOTE!!

Since this is a kind of demo application the MySQL databases is stored until the Docker container is alive. You'll have no data after container restarted.
