const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const dataFilePath = "./data.json";

const loadData = () => {
  const rawData = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(rawData);
};

const buildGraph = (data) => {
  const graph = {};

  for (const node of data.nodes) {
    graph[node.name] = [];
  }

  for (const edge of data.edges) {
    const { from, to } = edge;

    if (Array.isArray(to)) {
      for (const destNode of to) {
        graph[from].push(destNode);
      }
    } else {
      graph[from].push(to);
    }
  }

  return graph;
};

const findPaths = (graph, data) => {
  const paths = [];

  for (const node of data.nodes) {
    const visited = new Set();
    dfs(node.name, [], visited);
  }

  // depth-first search
  function dfs(nodeName, path, visited) {
    if (visited.has(nodeName)) return;

    path.push(nodeName);
    visited.add(nodeName);

    if (path.length > 1) {
      paths.push([...path]);
    }

    const neighbors = graph[nodeName] || [];
    for (const neighbor of neighbors) {
      dfs(neighbor, path, visited);
    }

    path.pop();
    visited.delete(nodeName);
  }

  return paths;
};

const filterPaths = (paths, data, options) => {
  const { exposedOnly, sinkOnly, vulnerableOnly } = options;

  return paths.filter((path) => {
    // Update the vulnerability status for each node on the path

    const pathWithVulnerability = path.map((nodeName) => {
      const currentNode = data.nodes.find(
        (service) => service.name === nodeName
      );
      if (currentNode) {
        return {
          name: currentNode.name,
          vulnerable:
            currentNode.vulnerabilities &&
            currentNode.vulnerabilities.length > 0,
        };
      }
    });

    // Check if any node on the path is vulnerable
    const hasVulnerableNode = pathWithVulnerability.some(
      (node) => node?.vulnerable
    );

    // Get the source and destination services for the current route
    const sourceService = data.nodes.find(
      (service) => service.name === path[0]
    );
    const destinationService = data.nodes.find(
      (service) => service.name === path[path.length - 1]
    );

    return (
      (!exposedOnly || sourceService.publicExposed) &&
      (!sinkOnly ||
        destinationService?.kind === "rds" ||
        destinationService?.kind === "sqs") &&
      (!vulnerableOnly || hasVulnerableNode)
    );
  });
};

const prepareResponse = (filteredRoutes, data) => {
  return filteredRoutes.map((route) => {
    // Extract the path array from each object in the filteredRoutes array
    return route.map((nodeName) => {
      const currentNode = data.nodes.find((node) => node.name === nodeName);
      return {
        name: nodeName,
        vulnerable:
          currentNode?.vulnerabilities &&
          currentNode.vulnerabilities.length > 0 &&
          currentNode.vulnerabilities
            .map((vulnerability) => vulnerability.message)
            .join(", "),
      };
    });
  });
};

app.use(cors({ origin: "http://localhost:3001" }));

app.get("/all-paths", (req, res) => {
  // query parameters
  const options = {
    exposedOnly: req.query.exposedOnly === "true",
    sinkOnly: req.query.sinkOnly === "true",
    vulnerableOnly: req.query.vulnerableOnly === "true",
  };

  const data = loadData();
  const graph = buildGraph(data);
  const paths = findPaths(graph, data);
  const filteredPaths = filterPaths(paths, data, options);
  const response = prepareResponse(filteredPaths, data);

  res.json(response);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
