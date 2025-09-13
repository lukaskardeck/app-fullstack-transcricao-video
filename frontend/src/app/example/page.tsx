// app/page.tsx (Next.js 13+ com App Router)
"use client";

import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState([
    { name: "Interview_Audio.mp3", date: "06 Oct 2023", status: "Completed" },
    { name: "Meeting_Video.mp4", date: "06 Oct 2023", status: "In Progress" },
    { name: "Lecture_Audio.mp3", date: "05 Oct 2023", status: "Pending" },
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-xl">TranscribeEasy</span>
        </div>
        <button className="bg-black text-white px-4 py-1 rounded-lg hover:bg-gray-800 transition">
          Logout
        </button>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col justify-center items-center px-4">
        <h1 className="text-xl font-medium mb-8 text-center">
          Welcome to TranscribeEasy
        </h1>

        <div className="w-full max-w-3xl bg-white shadow-md rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-6 py-3">File Name</th>
                <th className="px-6 py-3">Upload Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index} className="border-t">
                  <td className="px-6 py-3">{file.name}</td>
                  <td className="px-6 py-3">{file.date}</td>
                  <td className="px-6 py-3">{file.status}</td>
                  <td className="px-6 py-3">
                    <button className="bg-black text-white px-4 py-1 rounded-lg hover:bg-gray-800 transition">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upload Button */}
        <div className="mt-6">
          <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition">
            Upload MP3/MP4 Files (Max 25MB)
          </button>
        </div>
      </main>
    </div>
  );
}
