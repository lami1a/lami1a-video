 
import {Storage} from '@google-cloud/storage'
import * as express from 'express';
import * as  morgan from "morgan";
import * as  cors from "cors";
import  ffmpeg  from 'fluent-ffmpeg'
import * as fs from 'fs'
import {setupDirectories,  createProcessedBucket,convertVideo,
  deleteWorkingFiles,downloadRawVideo,
  uploadFolder,uploadProcessedVideo,upToBucket} from './utils'
const fileUpload = require('express-fileupload');

const app = express()
app.use(express.json())

app.use(fileUpload());
export const config = {
  api: {
    bodyParser: false
  }
}

app.get("/health", (req, res) => {
  return res.json({ ok: true, environment: process.env.NODE_ENV });
  });
  app.get("/", (req, res) => {
    try {
      
      /* try {
        setupDirectories()
      } catch (error) {
        console.log({error})
      } */
     // createProcessedBucket()
      //uploadFolder()
    upToBucket()
    } catch (error) {
      console.log({error})
    }
    return res.json({ ok: true,
       environment: process.env.NODE_ENV });
    });
    

app.post('/', async (req, res) => {
  try {


  const {file} = req?.body; // Path to and name of object. For example '../myFiles/index.js'.
      const fileStream = fs.readFileSync(file);
      try {
        const message = Buffer.from(req.body,'base64').toString('utf8')
       // data = JSON.parse(message)
        if(!file.name){
          throw new Error('invalidnpayload')
        }
  
      } catch (err: any) {
          // example to check for a very specific error
          console.error(err);
          res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
          res.status(400).send('Bad request');
          return;
      }
      const inputFileName = file.name
      const outputFileName = `prosessed-${inputFileName}` 
      setupDirectories()
      res.writeHead(200, { 'Content-Type': 'application/json' });
      await downloadRawVideo(inputFileName)
      // convert The video to 360p
      try {
        await convertVideo(inputFileName, outputFileName)
      } catch (error) {
       await Promise.all([deleteWorkingFiles(inputFileName),
            deleteWorkingFiles(outputFileName) ])
        
        
        console.log({error})
        return res.status(500).send('Internal server Error, process video fail')
        
      }
      // Upload processed video to cloud storage
      await uploadProcessedVideo(outputFileName)
        return res.status(200).send({success:true, message:'process finished successfully'})
       } catch (error) {
      return res.status(500).send({success:false})
      }
    })
      /* const token= nanoid()
      const { video } = files; // contains files
      const file = video['path']; // Path to and name of object. For example '../myFiles/index.js'.
      const fileStream = readFileSync(file);
      const newName = `${token}-${video['name']}`
      if (!video) {
        throw new Error('no file found')
      } else {
        try {
          
          const  processed = await  processRawVideo(fileStream)
           const filePath = `rawVid/${file}`
          const filePathProcess = `processVideos/${newName}` 
          await deleteWorkingFiles(filePathProcess)
      */

    
//      const s3Client = new S3Client({ region: 'eu-central-1' });
const port = process.env.PORT || 3011
app
.disable("x-powered-by")
.use(morgan("dev"))
.use(express.urlencoded({ extended: true }))
.use(express.json())
.use(cors());


app.listen(port,()  => {
  console.log('server started')
})


export default app