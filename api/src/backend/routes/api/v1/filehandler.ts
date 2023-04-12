import express from "express";
import db from "../../../db";
import multer from "multer";
import path from "path";
import * as models from "../../../models";
import * as fs from "fs";
import { fetchBrief, fetchItems } from "../../../models";


const router = express.Router();

const location = multer.diskStorage({
    destination (req, file, cb) {

        // Uploads is the Upload_folder_name
        cb(null, "./uploads")
    },
    filename (req, file, cb) {
        cb(null, file.originalname)
    }
})

const maxSize = 100 * 1000 * 1000;

const upload = multer({
    storage: location,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {

        // Set the filetypes, it is optional
        const filetypes = /pdf|jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);

        const extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
    },

}).single("brief");


router.post("/:id/upload", (req, res, next) => {
    const id = req.params.id;
    // Error MiddleWare for multer file upload, so if any
    // error occurs, the image would not be uploaded!
    upload(req,res, async err => {
        if(req.file?.destination === undefined){
            return next(new Error(
                "No file uploaded"
            ));
        }
        else {
            const url = req.file?.destination + "/" + req.file?.filename;
            if (err) {

                // ERROR occurred (here it can be occurred due
                // to uploading image of size greater than
                // 5MB or uploading different file type)
                res.send(err)
            } else {

                db.transaction(async tx => {

                    try {
                        const exists: any = await models.fetchBrief(id)(tx);
                        if (!exists) {
                            return next(new Error(
                                "Brief Doesn't Exist"
                            ));
                        }
                        await models.updateDocumentURL(parseInt(id), url)(tx);
                    } catch (e: any) {
                        return next(new Error(
                            `Failed to update document url: ${e.message}`,
                        ));
                    }
                });

                // SUCCESS, image successfully uploaded
                res.send(JSON.stringify("Success, Image uploaded!"));
            }
        }

    })
})


router.get('/download/:id',(req, res,next) => {
    const id = req.params.id;
    db.transaction(async tx => {
        try {
            const brief = await fetchBrief(id)(tx);
            const file = brief.document_url;
            const fileLocation = path.join('',file);
            console.log("Hello file location",fileLocation);
            res.download(fileLocation, file);
        } catch (e) {
            next(new Error(
                `Failed to fetch the file with brief id: ${id}`,
                { cause: e as Error }
            ));
        }
    });
});

export default router;
