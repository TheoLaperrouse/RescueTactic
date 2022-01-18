docker stop rescue-tactic_node_1
docker rm rescue-tactic_node_1
docker system prune -f
docker build -t rescueimage .
docker run -d --name rescue-tactic_node_1 -v /var/run/docker.sock:/var/run/docker.sock -p 3000:3000 -p 14540:14540/udp --network=rescue-tactic_default rescueimage
exit 0