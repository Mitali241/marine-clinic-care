
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getDatabase } from "@/lib/mongodb.server";

const testMongoConnection = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = await getDatabase();
    await db.command({ ping: 1 });

    return {
      success: true,
      database: db.databaseName,
      message: "MongoDB connected successfully!",
    };
  },
);

export const Route = createFileRoute("/db-test")({
  component: DbTestPage,
});

function DbTestPage() {
  const [message, setMessage] = useState("Click the button to test MongoDB.");

  async function checkConnection() {
    setMessage("Connecting...");

    try {
      const result = await testMongoConnection();
      setMessage(`${result.message} Database: ${result.database}`);
    } catch (error) {
      console.error(error);
      setMessage("Connection failed. Check the VS Code terminal.");
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">MongoDB Connection Test</h1>
      <button
        onClick={checkConnection}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Test Connection
      </button>
      <p className="mt-4">{message}</p>
    </main>
  );
}
