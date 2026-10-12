import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ message: "whenTeam API is running" });
  console.log("已返回消息");
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
