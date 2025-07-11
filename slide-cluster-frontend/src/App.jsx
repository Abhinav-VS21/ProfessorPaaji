import React, { useState, useEffect } from "react";
import ClusterGraph from "./ClusterGraph";
import Input from "./Input";

export default function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [defaultData, setDefaultData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    // Load default data on app start
    fetch("/clus.json")
      .then((response) => response.json())
      .then((data) => {
        const processedData = { nodes: data, links: [] };
        setDefaultData(processedData);
        setGraphData(processedData); // Set as initial data
      })
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  const handleFileUpload = (newData) => {
    setGraphData({
      nodes: newData,
      links: [],
    });
  };

  const handleResetToDefault = () => {
    setGraphData(defaultData);
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex">
      <Input
        onFileUpload={handleFileUpload}
        onResetToDefault={handleResetToDefault}
        graphData={graphData}
      />
      <div className="flex-1">
        <ClusterGraph GraphData={graphData} />
      </div>
    </div>
  );
}
