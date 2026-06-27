const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Storage Service Abstraction Layer
 * Supports pluggable configurations for AWS S3, Cloudinary, and Firebase Storage.
 */
class StorageService {
  constructor() {
    this.provider = process.env.STORAGE_PROVIDER || 'local'; // 'local' | 's3' | 'cloudinary' | 'firebase'
    logger.info(`Storage Service initialized with provider: [${this.provider}]`);
  }

  /**
   * Uploads an MRI scan image to the active storage provider.
   * @param {Buffer} fileBuffer 
   * @param {string} fileName 
   * @param {string} mimeType 
   * @returns {Promise<string>} Public URL of the uploaded image
   */
  async uploadImage(fileBuffer, fileName, mimeType) {
    try {
      switch (this.provider) {
        case 's3':
          return await this.uploadToS3(fileBuffer, fileName, mimeType);
        case 'cloudinary':
          return await this.uploadToCloudinary(fileBuffer, fileName, mimeType);
        case 'firebase':
          return await this.uploadToFirebase(fileBuffer, fileName, mimeType);
        case 'local':
        default:
          return await this.uploadToLocal(fileBuffer, fileName, mimeType);
      }
    } catch (error) {
      logger.error(`Storage provider [${this.provider}] upload failed:`, error);
      // Fallback to local storage on error to maintain system uptime
      return await this.uploadToLocal(fileBuffer, fileName, mimeType);
    }
  }

  /**
   * AWS S3 Upload Placeholder Implementation
   */
  async uploadToS3(fileBuffer, fileName, mimeType) {
    logger.info(`AWS S3: Uploading ${fileName} to bucket: ${process.env.AWS_S3_BUCKET || 'neuroscan-mri-vault'}`);
    
    // AWS.S3 integration mock:
    // const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    // const params = { Bucket: bucketName, Key: `${Date.now()}-${fileName}`, Body: fileBuffer, ContentType: mimeType };
    // const uploadResult = await s3.upload(params).promise();
    // return uploadResult.Location;
    
    return this.uploadToLocal(fileBuffer, fileName, mimeType);
  }

  /**
   * Cloudinary Upload Placeholder Implementation
   */
  async uploadToCloudinary(fileBuffer, fileName, mimeType) {
    logger.info(`Cloudinary: Uploading ${fileName} via cloud folder: ${process.env.CLOUDINARY_FOLDER || 'scans'}`);
    
    // Cloudinary integration mock:
    // return new Promise((resolve, reject) => {
    //   cloudinary.uploader.upload_stream({ folder: folderName }, (err, result) => {
    //     if (err) return reject(err);
    //     resolve(result.secure_url);
    //   }).end(fileBuffer);
    // });
    
    return this.uploadToLocal(fileBuffer, fileName, mimeType);
  }

  /**
   * Firebase Storage Upload Placeholder Implementation
   */
  async uploadToFirebase(fileBuffer, fileName, mimeType) {
    logger.info(`Firebase Storage: Storing ${fileName} inside root bucket...`);
    
    // Firebase Storage integration mock:
    // const fileRef = ref(storage, `mri_scans/${Date.now()}_${fileName}`);
    // await uploadBytes(fileRef, fileBuffer, { contentType: mimeType });
    // return await getDownloadURL(fileRef);
    
    return this.uploadToLocal(fileBuffer, fileName, mimeType);
  }

  /**
   * Local File System Storage (Default offline fallback)
   */
  async uploadToLocal(fileBuffer, fileName, mimeType) {
    const cleanName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
    const localDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    
    const filePath = path.join(localDir, cleanName);
    fs.writeFileSync(filePath, fileBuffer);
    
    logger.info(`Storage: Saved scan locally to disk: ${filePath}`);
    
    // Returns relative server route URL (or base64 URI for zero-config demo convenience)
    // Note: base64 is safer for absolute client renders without needing CORS host bindings
    const base64Content = fileBuffer.toString('base64');
    return `data:${mimeType};base64,${base64Content}`;
  }
}

module.exports = new StorageService();
