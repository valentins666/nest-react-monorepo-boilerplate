/// <reference types="node" />

const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

const validStages = ['prod', 'staging', 'dev', 'local'];

// Get stage from command line arguments
const stage = process.argv[2] || 'local';
if (!validStages.includes(stage)) {
  throw new Error(`Invalid stage. Must be one of: ${validStages.join(', ')}`);
}

// Load environment variables
let envPath = path.resolve(path.resolve('apps/backend/.env'));
if (stage !== 'local') {
  envPath = path.resolve(`apps/backend/.env.${stage}`);
}
dotenv.config({ path: envPath });

async function deployLocal() {
  try {
    console.log('Deploying backend locally...');

    // Check if container is already running
    try {
      const containerStatus = execSync(
        'docker ps --filter "name=backend-local" --format "{{.Status}}"',
      )
        .toString()
        .trim();
      if (containerStatus) {
        console.log('Stopping existing backend container...');
        execSync('docker stop backend-local && docker rm backend-local', {
          stdio: 'inherit',
        });
      }
    } catch (error) {
      console.log(error);
      // Container not found, proceed with deployment
    }

    // Build the image
    console.log('Building backend image...');
    execSync(
      'docker build -t backend:local --build-arg STAGE=local -f apps/backend/Dockerfile .',
      { stdio: 'inherit' },
    );

    // Run the container
    console.log('Starting backend container...');
    execSync(
      'docker run -d --name backend-local ' +
        '-p 3000:3000 ' +
        '--network=host ' + // Use host network to connect to local PostgreSQL
        '--restart unless-stopped ' +
        'backend:local',
      { stdio: 'inherit' },
    );

    console.log('Local backend deployment completed successfully');
  } catch (error) {
    console.error('Error deploying backend locally:', error);
    process.exit(1);
  }
}

// AWS configuration for non-local deployments
const region = stage !== 'local' ? process.env.AWS_REGION || 'us-east-1' : '';
const ecrRepo = stage !== 'local' ? process.env.AWS_ECR_BACKEND_REPOSITORY : '';
const ecsCluster = stage !== 'local' ? process.env.AWS_ECS_CLUSTER : '';
const ecsService = stage !== 'local' ? process.env.AWS_ECS_BACKEND_SERVICE : '';
const ecsTaskFamily =
  stage !== 'local' ? process.env.AWS_ECS_BACKEND_TASK_FAMILY : '';
const containerName =
  stage !== 'local' ? process.env.BACKEND_CONTAINER_NAME : '';

async function deployAWS() {
  try {
    // Build and tag the backend image
    console.log('Building backend image...');
    execSync(
      `docker build -t backend:${stage} \
       --build-arg STAGE=${stage} \
       --build-arg PORT=${process.env.PORT} \
       -f apps/backend/Dockerfile .`,
      { stdio: 'inherit' },
    );

    // Push to ECR
    const accountId = process.env.AWS_ACCOUNT_ID;
    console.log('Pushing to ECR...');

    if (!accountId || !ecrRepo) {
      throw new Error('Missing AWS_ACCOUNT_ID or ECR_REPOSITORY_NAME');
    }

    const ecrUrl = `${accountId}.dkr.ecr.${region}.amazonaws.com`;
    execSync(
      `aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${ecrUrl}`,
      { stdio: 'inherit' },
    );
    execSync(`docker tag backend:${stage} ${ecrUrl}/${ecrRepo}:${stage}`, {
      stdio: 'inherit',
    });
    execSync(`docker push ${ecrUrl}/${ecrRepo}:${stage}`, {
      stdio: 'inherit',
    });

    // Update ECS service
    console.log('Updating ECS service...');
    execSync(
      `aws ecs update-service --cluster ${ecsCluster} --service ${ecsService} --force-new-deployment --region ${region}`,
      { stdio: 'inherit' },
    );

    console.log('Backend deployment completed successfully');
  } catch (error) {
    console.error('Error deploying backend:', error);
    process.exit(1);
  }
}

async function main() {
  if (stage === 'local') {
    await deployLocal();
    return;
  }

  // Validate AWS environment variables for non-local deployments
  if (
    !ecrRepo ||
    !ecsCluster ||
    !ecsService ||
    !ecsTaskFamily ||
    !containerName
  ) {
    console.error('Missing required environment variables for AWS deployment');
    process.exit(1);
  }

  await deployAWS();
}

main().catch((error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
