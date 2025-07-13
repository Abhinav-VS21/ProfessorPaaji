import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import ClusterExplanationPanel from "./ClusterExplanationPanel";

export default function ClusterGraph({ GraphData }) {
  const fgRef = useRef();
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [clusterExplanation, setClusterExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    const clusterCenters = {};
    const clusterCount = GraphData.nodes.reduce((acc, node) => {
      const clusterId = node.cluster_id ?? "bogus";
      if (!acc[clusterId]) acc[clusterId] = 1;
      return acc;
    }, {});

    // Assign a fixed position to each cluster
    const radius = 150;
    const clusterKeys = Object.keys(clusterCount);
    clusterKeys.forEach((cid, i) => {
      clusterCenters[cid] = {
        x: radius * Math.cos((2 * Math.PI * i) / clusterKeys.length),
        y: radius * Math.sin((2 * Math.PI * i) / clusterKeys.length),
      };
    });

    // Add custom force to pull nodes to cluster centers
    const pullStrength = 0.1;
    fg.d3Force("cluster", function (alpha) {
      GraphData.nodes.forEach((node) => {
        const clusterId = node.cluster_id ?? "bogus";
        const center = clusterCenters[clusterId];
        if (center) {
          node.vx += (center.x - node.x) * alpha * pullStrength;
          node.vy += (center.y - node.y) * alpha * pullStrength;
        }
      });
    });
  }, [GraphData]);

  // Function to send cluster content to Gemini
  const explainCluster = async (clusterId) => {
    setIsExplaining(true);
    setClusterExplanation("");

    // Get all nodes in this cluster
    const clusterNodes = GraphData.nodes.filter(
      (n) => n.cluster_id === clusterId
    );

    // Combine all slide content from this cluster
    const clusterContent = clusterNodes
      .map(
        (node) =>
          `Slide ${node.slide_id}: ${node.title}\nContent: ${
            node.body || "No content"
          }\nNotes: ${node.notes || "No notes"}`
      )
      .join("\n\n");

    try {
      const formData = new FormData();
      formData.append("cluster_data", clusterContent);

      const response = await fetch(
        "http://34.131.148.200:8000/api/explain-cluster",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClusterExplanation(data.explanation);
      } else {
        setClusterExplanation("Failed to get explanation from AI");
      }
    } catch (error) {
      console.error("Error explaining cluster:", error);
      setClusterExplanation("Error connecting to AI service");
    } finally {
      setIsExplaining(false);
    }
  };

  // Handle node click to select cluster
  const handleNodeClick = (node) => {
    const clusterId = node.cluster_id;
    if (selectedCluster === clusterId) {
      // Deselect if clicking the same cluster
      setSelectedCluster(null);
      setClusterExplanation("");
    } else {
      // Select new cluster and explain it
      setSelectedCluster(clusterId);
      explainCluster(clusterId);
    }
  };

  // Clear selection handler
  const handleClearSelection = () => {
    setSelectedCluster(null);
    setClusterExplanation("");
  };

  // Get node color based on selection
  const getNodeColor = (node) => {
    if (selectedCluster === null) {
      return undefined; // Default auto-coloring
    } else if (selectedCluster === node.cluster_id) {
      return "#ff4444"; // Highlight selected cluster
    } else {
      return "#666666"; // Dim unselected clusters
    }
  };

  // Custom hover label function
  const nodeHoverLabel = (node) => {
    const isSelected = selectedCluster === node.cluster_id;
    return `
        <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
          <strong>Cluster ID:</strong> ${node.cluster_id || "N/A"}<br/>
          <strong>Topic:</strong> ${node.title || "No Title"}<br/>
          <strong>Slide ID:</strong> ${node.slide_id || "N/A"}<br/>
          ${
            isSelected
              ? '<strong style="color: #ff4444;">SELECTED CLUSTER</strong>'
              : "<em>Click to select & explain cluster</em>"
          }
        </div>
      `;
  };

  return (
    <div className="relative">
      {/* Cluster Explanation Panel */}
      <ClusterExplanationPanel
        selectedCluster={selectedCluster}
        GraphData={GraphData}
        clusterExplanation={clusterExplanation}
        isExplaining={isExplaining}
        onClearSelection={handleClearSelection}
        onReExplain={explainCluster}
      />

      {/* Graph */}
      <div className="h-screen w-screen">
        <ForceGraph2D
          ref={fgRef}
          graphData={GraphData}
          nodeLabel={nodeHoverLabel}
          nodeColor={selectedCluster === null ? undefined : getNodeColor}
          onNodeClick={handleNodeClick}
          nodeRelSize={6}
          width={window.innerWidth - 320} // Account for sidebar
          height={window.innerHeight}
        />
      </div>
    </div>
  );
}
