import React, { useState, useEffect } from "react";
const backend_ip = "34.131.167.6";

export default function Input({ onFileUpload, graphData, onResetToDefault }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null); // Keep uploaded file
  const [isUploading, setIsUploading] = useState(false);
  const [threshold, setThreshold] = useState(0.4);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleThresholdChange = (e) => {
    setThreshold(parseFloat(e.target.value));
  };

  const uploadFile = async (file, thresholdValue) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("threshold", thresholdValue);

    try {
      const response = await fetch(
        "https://" + backend_ip + ":8000/api/cluster",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        onFileUpload(data);
        return true;
      } else {
        console.error("Upload failed");
        return false;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleInitialUpload = async () => {
    if (!selectedFile) return;

    const success = await uploadFile(selectedFile, threshold);
    if (success) {
      setUploadedFile(selectedFile);
      setSelectedFile(null);
    }
  };

  // Re-process when threshold changes and we have an uploaded file
  useEffect(() => {
    if (uploadedFile && !isUploading) {
      const timeoutId = setTimeout(() => {
        uploadFile(uploadedFile, threshold);
      }, 500); // Debounce threshold changes

      return () => clearTimeout(timeoutId);
    }
  }, [threshold, uploadedFile]);

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setSelectedFile(null);
    onResetToDefault(); // Use the reset function instead
  };

  return (
    <div className="w-80 bg-gray-800 text-white p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-6">Professor Paaji</h2>

      {!uploadedFile && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select PPTX File
          </label>
          <input
            type="file"
            accept=".pptx"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
            value=""
          />
        </div>
      )}

      {uploadedFile && (
        <div className="mb-4 p-3 bg-green-800 rounded">
          <p className="text-sm font-medium">Uploaded: {uploadedFile.name}</p>
          <p className="text-xs text-gray-300">
            Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <button
            onClick={handleRemoveFile}
            className="mt-2 text-xs text-red-300 hover:text-red-200"
          >
            Remove file
          </button>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Clustering Threshold
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={threshold}
          onChange={handleThresholdChange}
          disabled={!uploadedFile && !selectedFile}
          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white disabled:opacity-50"
          placeholder="0.4"
        />
        <p className="text-xs text-gray-400 mt-1">
          {uploadedFile
            ? "Changes will re-cluster automatically"
            : "Higher values = fewer, larger clusters"}
        </p>
      </div>

      {selectedFile && !uploadedFile && (
        <div className="mb-4 p-3 bg-gray-700 rounded">
          <p className="text-sm">Selected: {selectedFile.name}</p>
          <p className="text-xs text-gray-300">
            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {!uploadedFile && (
        <button
          onClick={handleInitialUpload}
          disabled={!selectedFile || isUploading}
          className={`w-full py-2 px-4 rounded font-medium ${
            !selectedFile || isUploading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload & Cluster"}
        </button>
      )}

      {isUploading && uploadedFile && (
        <div className="mb-4 p-2 bg-blue-800 rounded text-center">
          <p className="text-sm">Re-clustering...</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-600">
        <h3 className="text-lg font-semibold mb-2">Graph Info</h3>
        <p className="text-sm text-gray-300">
          Nodes: {graphData?.nodes?.length || 0}
        </p>
        <p className="text-sm text-gray-300">
          Clusters:{" "}
          {graphData?.nodes
            ? new Set(graphData.nodes.map((n) => n.cluster_id)).size
            : 0}
        </p>
        {uploadedFile && (
          <p className="text-sm text-gray-300">Threshold: {threshold}</p>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400">
        <p>• Upload a .pptx file to cluster slides</p>
        <p>• Adjust threshold to re-cluster automatically</p>
        <p>• Hover over nodes to see details</p>
      </div>
    </div>
  );
}
