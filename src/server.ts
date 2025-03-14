import express from "express"
import morgan from "morgan"
import cors from "cors"

import { routes } from "@/src/routes"
import { ErrorInternal } from "./middlewares/ErrorInternal"

const app = express()

// Parse JSON bodies
app.use(express.json())

// security
app.use(cors())
app.use(express.urlencoded({ extended: true }))

// Request logger
app.use(morgan("dev"))

// Routes
app.use(routes)
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  ErrorInternal(err, req, res, next);
});

export { app }
