import express from "express";

const router = express.Router()

router.use("/version-check", (req,res)=>{
    res.json({
        version: "1.0.0"
    })
})

export default router;