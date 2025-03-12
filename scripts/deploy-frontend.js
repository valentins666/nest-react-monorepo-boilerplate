/// <reference types="node" />

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const {
  CloudFrontClient,
  CreateInvalidationCommand,
} = require('@aws-sdk/client-cloudfront');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const validStages = ['prod', 'staging', 'dev', 'local'];

// Get stage from command line arguments
const stage = process.argv[2] || 'local';
if (!validStages.includes(stage)) {
  throw new Error(`Invalid stage. Must be one of: ${validStages.join(', ')}`);
}

// Load environment variables
let envPath = path.resolve('apps/frontend/.env');
if (stage !== 'local') {
  envPath = path.resolve(`apps/frontend/.env.${stage}`);
}
dotenv.config({ path: envPath });

async function deployLocal() {
  try {
    console.log('Deploying frontend locally...');

    // Start local server using serve
    console.log('Starting local server...');
    execSync('npx serve -s apps/frontend/dist -l 4000', { stdio: 'inherit' });

    console.log('Frontend is running at http://localhost:4000');
  } catch (error) {
    console.error('Error deploying frontend locally:', error);
    process.exit(1);
  }
}

// AWS configuration for non-local deployments
const region = stage !== 'local' ? process.env.AWS_REGION || 'us-east-1' : '';
const bucketName = stage !== 'local' ? process.env.AWS_S3_BUCKET_NAME : '';
const distributionId =
  stage !== 'local' ? process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID : '';

// Only initialize AWS clients for non-local deployments
const s3Client = stage !== 'local' ? new S3Client({ region }) : null;
const cloudFrontClient =
  stage !== 'local' ? new CloudFrontClient({ region }) : null;

async function deployAWS() {
  try {
    if (!bucketName || !distributionId) {
      throw new Error('Missing S3_BUCKET or CLOUDFRONT_DISTRIBUTION_ID');
    }

    const distPath = path.resolve('apps/frontend/dist');
    const files = getAllFiles(distPath);

    // Upload files to S3
    console.log('Uploading dist files to S3...');
    for (const file of files) {
      const key = path.relative(distPath, file);
      const content = fs.readFileSync(file);
      const contentType = mime.lookup(file) || 'application/octet-stream';

      await s3Client?.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: content,
          ContentType: contentType,
        }),
      );
      console.log(`Uploaded ${key}`);
    }

    // Invalidate CloudFront cache
    console.log('Invalidating CloudFront cache...');
    await cloudFrontClient?.send(
      new CreateInvalidationCommand({
        DistributionId: 'distributionId',
        InvalidationBatch: {
          CallerReference: new Date().getTime().toString(),
          Paths: {
            Quantity: 1,
            Items: ['/*'],
          },
        },
      }),
    );

    console.log('Frontend deployment completed successfully');
  } catch (error) {
    console.error('Error deploying frontend:', error);
    process.exit(1);
  }
}

function getAllFiles(dirPath) {
  const files = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  if (stage === 'local') {
    await deployLocal();
    return;
  }

  await deployAWS();
}

main().catch((error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
