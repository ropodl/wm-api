import express from "express";
import system from "./system/index.js"
import application from "./application/index.js"

const router = express.Router()

router.use("/system", system)
router.use("/", application)

router.use("version-check/", (req,res)=>{
    res.json({
        version: "1.0.0"
    })
})

export default router;