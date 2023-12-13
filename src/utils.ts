
import {Storage} from '@google-cloud/storage'

import { readdir } from 'node:fs/promises';
import {unlink, stat, mkdir,readFile} from 'node:fs'
import { nanoid } from 'nanoid';
import { Buffer } from 'node:buffer';
const path = require('node:path'); 
const ffmpeg = require('fluent-ffmpeg');
const storage = new Storage({keyFilename: 'lami1a-1-key.json'});
/**
 * TODO(developer): Uncomment these variables before running the sample.
 */

// The ID of your GCS bucket
const bucketName = 'raw-lami1a-lessons';
const bucketNameProcessed = 'processed-lami1a-lessons';
const localBucketName = 'local-lami1a-lessons-raw';
const localBucketNameProcessed = 'local-lami1a-lessons-processed';

storage.getBuckets(x=> {console.log(x)} )
 // Creates the new bucket
 export async function createProcessedBucket() {
  await storage.bucket(bucketNameProcessed);
  console.log(`Bucket ${bucketNameProcessed} is there .`);
}

// CALL 
createProcessedBucket().catch(console.error);

  // AVAILABILITY
  async function ensureDirectoryExistence(dirpath:string){
      stat(dirpath,(err, stats) => {
      if(stats?.isDirectory()){
        console.log(`${dirpath} exists`)
      }else {

        mkdir(dirpath,{recursive:true}, (err) => {
          if (err) throw err;
        })
        console.log(`${dirpath} created`)
     
      }
      console.log(stats);
      });
     }

export function setupDirectories(){
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

export function convertVideo(rawVideoName:string, 
  processedVideoName:string){
  return new Promise((resolve, reject) => {

    ffmpeg(rawVideoName).outputOptions("-vf", "scale=-1:360")//360p
    .on("end",() => {
      resolve(processedVideoName)
  
    }).on("error",(err) => {
      return reject(err.message)
    }).save(processedVideoName)
  })}

export async function deleteWorkingFiles(filePath:string){
  const statFile =  stat(filePath,(err, stats) => {
    if(stats.isFile()){
      unlink(filePath,(err)=> {
      console.log(`${filePath} exists`)
    })}
    else {
 
      console.log(`${filePath} doesn t exist`)
         } 
    })
}
export const processFile = async (file:string) => {
  try{
    const inputFileName = file.split('/')[file.split('/').length-1]
        const outputFileName = `${localBucketNameProcessed}/prosessed-${inputFileName}` 
  ffmpeg().input(file).outputOptions("-vf", "scale=-1:360")//360p
    .on("end",() => {
      }).on("error",(err) => {
      return err
    }).save(outputFileName)
   
    } catch (err: any) {
        // example to check for a very specific error
        console.error(err);
        return;
    }
  }
export const uploadFolder = async () => {
      try {
      const fileList:string[] = [];
      const getFiles = async directory => {
      const items = await readdir(directory);
      console.log({items})
      for(const item of items) {
          console.log({item})
          const fullPath = path.join(directory, item);
          stat(fullPath,async (err, stats) => {
            if (stats.isFile()) {
          
              console.log({fullPath})
              await processFile(fullPath)
              const inputFileName = fullPath.split('/')[fullPath.split('/').length-1]
              const fileName = path.relative(localBucketNameProcessed,`prosessed-${inputFileName}`);
          
          const destination = `${bucketNameProcessed}/${fileName}`;
              return storage
            .bucket(bucketName)
            .upload(fullPath, { destination })
            .then(
              uploadResp => ({ fileName: destination, status: uploadResp[0] }),
              err => ({ fileName: destination, response: err })
            )
            
          }}
          )
        }
        }
  
    getFiles(localBucketName)

  } catch (e) {
      console.error(e.message);
      throw new Error('Can\'t store folder.');
    }
  };
  export const upToBucket = async () => {
    try {
  const items = await readdir(localBucketNameProcessed);
    console.log({items})
    for(const item of items){ 
        console.log({item})
        const fullPath = path.join(localBucketNameProcessed, item);
          console.log({fullPath})
            await processFile(fullPath)
            const inputFileName = fullPath.split('/')[fullPath.split('/').length-1]
            const fileName = path.relative('',`${localBucketNameProcessed}/${inputFileName}`);
        
        const destination = `${bucketNameProcessed}/${inputFileName}`;
         const res =  await storage
          .bucket(bucketName)
          .upload(fullPath, { destination })
          .then(
            uploadResp => ({ fileName: destination, status: uploadResp[0] }),
            err => ({ fileName: destination, response: err })
          )
          console.log( `copy ${fileName} to  ${destination} is ${res}`)
          }
} catch (e) {
    console.error(e.message);
    throw new Error('Can\'t store folder.');
  }
};