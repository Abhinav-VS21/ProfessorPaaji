import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/api/cluster", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Slide Clustering Tool</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="file"
          accept=".pptx"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-2"
        />
        <button type="submit">Upload and Cluster</button>
      </form>

      <hr className="my-4" />

      <h2 className="font-semibold mb-2">Results:</h2>
      {results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        results.map((slide, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded">
            <p>
              <strong>Cluster:</strong> {slide.cluster_id}
            </p>
            <p>
              <strong>Title:</strong> {slide.title}
            </p>
            <p>
              <strong>Body:</strong> {slide.body}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
