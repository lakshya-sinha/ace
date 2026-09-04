import express from "express";

const app = express();
//middlewares
app.use(express.json({limit: "32kb"}));
app.use(express.urlencoded({extended:true, limit: "32kb"}));
app.use(express.static("public"));

//cors (i will setup this )


//routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
app.use("/api/v1/healthcheck", healthcheckRouter);



export default app;

