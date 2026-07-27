import { useState } from "react";
import Card from "../../../components/ui/Card";

function BulkOrder() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    console.log("Uploading:", file);

    // TODO: API call
  };

  return (
    <div className="space-y-6">

      {/* INFO */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        Upload your bulk orders using Excel or CSV file.
      </div>

      {/* UPLOAD CARD */}
      <Card title="Bulk Upload">

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">

          <p className="mb-3 text-gray-500">
            Drag & Drop your file here
          </p>

          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
            className="mb-4"
          />

          {file && (
            <p className="text-sm text-green-600 mb-2">
              Selected: {file.name}
            </p>
          )}

          <button
            onClick={handleUpload}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Upload File
          </button>

        </div>

      </Card>

    </div>
  );
}

export default BulkOrder;