import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./lib/logger";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

app.use("/api", router);

export default app;
