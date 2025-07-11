import React from "react";

export default function ClusterExplanationPanel({
  selectedCluster,
  GraphData,
  clusterExplanation,
  isExplaining,
  onClearSelection,
  onReExplain,
}) {
  if (selectedCluster === null) return null;

  const clusterNodes = GraphData.nodes.filter(
    (n) => n.cluster_id === selectedCluster
  );

  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg z-10 max-w-md max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Cluster {selectedCluster}</h3>
        <button
          onClick={onClearSelection}
          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          ✕
        </button>
      </div>

      <p className="text-sm text-gray-300 mb-3">
        {clusterNodes.length} slides in this cluster
      </p>

      {/* Slide List */}
      <div className="mb-3 max-h-32 overflow-y-auto">
        <h5 className="text-xs font-semibold text-gray-400 mb-1">Slides:</h5>
        {clusterNodes.map((node) => (
          <div
            key={node.slide_id}
            className="text-xs text-gray-300 mb-1 p-1 bg-gray-700 rounded"
          >
            <span className="font-medium">Slide {node.slide_id}:</span>{" "}
            {node.title}
          </div>
        ))}
      </div>

      {/* Loading state */}
      {isExplaining && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-blue-400">AI is analyzing cluster...</span>
        </div>
      )}

      {/* Gemini Explanation */}
      {clusterExplanation && !isExplaining && (
        <div className="mt-3 p-3 bg-gray-800 rounded">
          <h4 className="font-semibold text-blue-300 mb-2">
            🤖 Gemini Explanation:
          </h4>
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
            {clusterExplanation}
          </p>
        </div>
      )}

      {/* Re-explain button */}
      {clusterExplanation && !isExplaining && (
        <button
          onClick={() => onReExplain(selectedCluster)}
          className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
        >
          🔄 Re-explain
        </button>
      )}

      {/* Error state */}
      {!clusterExplanation && !isExplaining && selectedCluster !== null && (
        <div className="mt-3 p-3 bg-red-900 bg-opacity-50 rounded">
          <p className="text-sm text-red-200">
            No explanation available. Try clicking "Re-explain" to generate one.
          </p>
        </div>
      )}
    </div>
  );
}
