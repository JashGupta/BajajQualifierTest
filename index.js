import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const EMAIL = "jashan2573.be23@chitkara.edu.in";

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL,
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Exactly one key is required",
      });
    }

    const key = keys[0];
    let result;

    switch (key) {
      case "fibonacci": {
        const n = body.fibonacci;
        if (!Number.isInteger(n) || n < 0) throw new Error("Invalid input");

        let fib = [0, 1];
        for (let i = 2; i < n; i++) {
          fib.push(fib[i - 1] + fib[i - 2]);
        }
        result = fib.slice(0, n);
        break;
      }

      case "prime": {
        if (!Array.isArray(body.prime)) throw new Error("Invalid input");
        result = body.prime.filter(isPrime);
        break;
      }

      case "lcm": {
        if (!Array.isArray(body.lcm)) throw new Error("Invalid input");
        result = body.lcm.reduce((a, b) => lcm(a, b));
        break;
      }

      case "hcf": {
        if (!Array.isArray(body.hcf)) throw new Error("Invalid input");
        result = body.hcf.reduce((a, b) => gcd(a, b));
        break;
      }

      case "AI": {
        const question = body.AI;
        if (typeof question !== "string") throw new Error("Invalid input");

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const response = await model.generateContent(question);

        result = response.response.text().trim().split(" ")[0];
        break;
      }

      default:
        throw new Error("Invalid key");
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      is_success: false,
      error: err.message,
    });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
