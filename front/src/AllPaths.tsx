import Graph from "react-graph-vis";
import React, { useState, useEffect } from "react";
import { Alert } from "@mui/material";

import "./App.css";
import "vis-network/styles/vis-network.css";

interface PathNode {
  id: string;
  name: string;
  vulnerable?: string;
}

interface Props {
  exposedOnly: boolean;
  sinkOnly: boolean;
  vulnerableOnly: boolean;
}

const options = {
  layout: {
    hierarchical: {
      direction: "LR", //"LR" for left-to-right
      sortMethod: "directed",
      levelSeparation: 200,
      nodeAlignment: "TOP",
    },
  },
  interaction: {
    hover: true, // Enable hover events
  },
  nodes: {
    shape: "box",
  },
  edges: {
    color: {
      highlight: "purple",
    },
    arrows: {
      to: { enabled: true, scaleFactor: 0.5 },
    },
  },
};

function AllPaths({ exposedOnly, sinkOnly, vulnerableOnly }: Props) {
  const [paths, setPaths] = useState<PathNode[][]>([]);
  const [nodes, setNodes] = useState<PathNode[]>([]);
  const [edges, setEdges] = useState<{ from: string; to: string }[]>([]);

  const [hoveredNode, setHoveredNode] = useState(null);

  const dataURL = "http://localhost:3000/";

  useEffect(() => {
    fetch(
      `${dataURL}all-paths?exposedOnly=${exposedOnly}&sinkOnly=${sinkOnly}&vulnerableOnly=${vulnerableOnly}`
    )
      .then((response) => response.json())
      .then((data) => setPaths(data))
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [exposedOnly, sinkOnly, vulnerableOnly]);

  useEffect(() => {
    const pathNames = paths.map((path) => path);
    const uniqueArr = pathNames
      .flatMap((obj: PathNode[]) => obj)
      .reduce((unique: PathNode[], obj: PathNode) => {
        if (!unique.find((item) => item.name === obj.name)) {
          unique.push(obj);
        }
        return unique;
      }, []);

    const nodesWithIds = uniqueArr.map((node: PathNode, index: number) => ({
      name: node.name,
      id: `node_${index}`,
      label: node.name,
      vulnerable: node.vulnerable,
      color: node.vulnerable ? "#ff4d4d" : "#add8e6",
    }));
    setNodes(nodesWithIds);
  }, [paths]);

  useEffect(() => {
    const newEdges: { from: string; to: string }[] = [];
    paths.forEach((path) => {
      for (let i = 0; i < path.length - 1; i++) {
        const fromNode = nodes.find((node) => node.name === path[i]?.name);
        const toNode = nodes.find((node) => node.name === path[i + 1]?.name);
        if (fromNode && toNode) {
          newEdges.push({
            from: fromNode.id,
            to: toNode.id,
          });
        }
      }
    });
    setEdges(newEdges);
  }, [paths, nodes]);

  const handleHoverNode = (event: any) => {
    setHoveredNode(event.node);
  };

  const handleBlurNode = () => {
    setHoveredNode(null);
  };

  const graph = { nodes, edges };
  const events = {
    hoverNode: handleHoverNode,
    blurNode: handleBlurNode,
  };

  const vulnerabilityNode = (nodeid: string) => {
    const eachNode = nodes.filter((node) => node.id === nodeid);
    return eachNode[0].vulnerable || "None";
  };

  return (
    <div className="container">
      <Graph
        graph={graph}
        options={options}
        events={events}
        className="graph-container"
      />
      {hoveredNode && (
        <Alert
          severity={
            vulnerabilityNode(hoveredNode) === "None" ? "success" : "error"
          }
        >
          Vulnerability: {vulnerabilityNode(hoveredNode)}
        </Alert>
      )}
    </div>
  );
}

export default AllPaths;
