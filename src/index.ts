 
import {Storage} from '@google-cloud/storage'
import * as express from 'express';

import  ffmpeg  from 'fluent-ffmpeg'
import * as fs from 'fs'
import { nanoid } from 'nanoid';
const app = express()
app.use(express.json())

export const config = {
  api: {
    bodyParser: false
  }
}
const storage = new Storage({keyFilename: 'lami1a-key.json'});

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// The ID of your GCS bucket
 const bucketName = 'lami1a-lessons-raw';
 const bucketNameProcessed = 'lami1a-lessons-processed';
 const localBucketName = 'local-lami1a-lessons-r  aw';
 const localBucketNameProcessed = 'local-lami1a-lessons-processed';

 // Creates the new bucket
 async function createBucket() {
  await storage.bucket(bucketName);
  console.log(`Bucket ${bucketName} is there .`);
}

// CALL 
createBucket().catch(console.error);

function setupDirectories(){
  ensureDirectoryExistence(localBucketName)
  ensureDirectoryExistence(localBucketNameProcessed)
}

export async function downloadRawVideo(fileName:string) {
  await storage.bucket(bucketName).file(fileName)
  .download({destination:`${localBucketName}/${fileName}`})
  console.log(`downloaded from ${bucketName}/${fileName} Bucket  
  to ${localBucketName}/${fileName} `);
}


export async function uploadProcessedVideo(fileName:string) {
  try {
    const bucket =  await storage.bucket(bucketNameProcessed)
    await bucket.upload(`${localBucketNameProcessed}/${fileName}`, {
     destination:fileName
    })
    // we must make it public 
    console.log(`Upload from Bucket ${localBucketNameProcessed}/${fileName} to gs://${bucketNameProcessed}/${fileName}  uplloaded successfully .`);   

    await bucket.file(fileName).makePublic()
     console.log(`Bucket ${fileName} is uplloaded successfully .`);   
  } catch (error:any) {
  throw new Error(error)   
  }}

export function convertVideo(rawVideoName:string, processedVideoName:string){
  return new Promise((resolve, reject) => {

    ffmpeg(rawVideoName).outputOptions("-vf", "scale=-1:360")//360p
    .on("end",() => {
      resolve(processedVideoName)
  
    }).on("error",(err) => {
      return reject(err.message)
    }).save(processedVideoName)
  })}

export function deleteWorkingFiles(filePath:string){
  return new Promise<void>((resolve, reject) => {
    if(fs.existsSync(filePath)) {
     fs.unlink(filePath,(err)=> {
      if(err) {
    console.log(`File not found in ${filePath}`)
        console.log({err})
      }else {
        resolve()
      }
     } )
    }else {
      reject(`${filePath} doesn t exist`)
    }
  })
}

  // AVAILABILITY
function ensureDirectoryExistence(dirpath:string){
    return new  Promise<void>((resolve, reject) => {
      if(!fs.existsSync(dirpath)){
        fs.mkdirSync(dirpath,{recursive:true})
        console.log(`directory ${dirpath} created`)
        resolve()
      }else {
        resolve()
}} )}

app.post('/', async (req, res) => {
  try {
      let data;
      let files;
      try {
        const message = Buffer.from(req.body.message.data,'base64').toString('utf8')
        data = JSON.parse(message)
        if(!data.name){
          throw new Error('invalidnpayload')
        }
        files = req.body.file;
      } catch (err: any) {
          // example to check for a very specific error
          console.error(err);
          res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
          res.status(400).send('Bad request');
          return;
      }
      const inputFileName = data.name
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




export default app