/// <reference types="node" />

const { ECSClient, DescribeServicesCommand } = require('@aws-sdk/client-ecs');
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

// const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

async function deployLocal() {
  try {
    console.log('Deploying PostgreSQL locally...');

    // Check if container is already running
    try {
      const containerStatus = execSync(
        'docker ps --filter "name=postgres-local" --format "{{.Status}}"',
      )
        .toString()
        .trim();
      if (containerStatus) {
        console.log('PostgreSQL is already running locally');
        return;
      }
    } catch (error) {
      console.log(error);
      // Container not found, proceed with deployment
    }

    // Build the image
    console.log('Building PostgreSQL image...');
    execSync(
      `docker build -t postgres:local --build-arg STAGE=local --build-arg DB_PORT=${dbPort} -f apps/backend/src/database/Dockerfile .`,
      { stdio: 'inherit' },
    );

    // Run the container
    console.log('Starting PostgreSQL container...');
    execSync(
      'docker run -d --name postgres-local ' +
        `-p ${dbPort}:5432 ` +
        `-e POSTGRES_USER=${dbUser} ` +
        `-e POSTGRES_PASSWORD=${dbPassword} ` +
        `-e POSTGRES_DB=${dbName} ` +
        '--restart unless-stopped ' +
        '-v postgres-data:/var/lib/postgresql/data ' +
        `postgres:local`,
      { stdio: 'inherit' },
    );

    console.log('Local PostgreSQL deployment completed successfully');
  } catch (error) {
    console.error('Error deploying PostgreSQL locally:', error);
    process.exit(1);
  }
}

// AWS configuration for non-local deployments
const region = stage !== 'local' ? process.env.AWS_REGION || 'us-east-1' : '';
const ecrRepositoryName =
  stage !== 'local' ? `${process.env.AWS_ECR_REPOSITORY_NAME}` : '';
const ecsCluster = stage !== 'local' ? process.env.AWS_ECS_CLUSTER : '';
const ecsService = stage !== 'local' ? process.env.AWS_ECS_DB_SERVICE : '';
const ecsTaskFamily =
  stage !== 'local' ? `${process.env.AWS_ECS_DB_TASK_FAMILY}` : '';
const containerName =
  stage !== 'local' ? `${process.env.DB_CONTAINER_NAME}` : '';

// Only initialize AWS clients for non-local deployments
const ecsClient = stage !== 'local' ? new ECSClient({ region }) : null;

async function isPostgresRunning() {
  try {
    const command = new DescribeServicesCommand({
      cluster: ecsCluster,
      services: [ecsService ?? ''],
    });

    const response = await ecsClient?.send(command);
    const service = response?.services?.[0];

    if (!service) {
      return false;
    }

    // Check if service is active and has desired count > 0
    return (
      service.status === 'ACTIVE' &&
      !!service.desiredCount &&
      service.runningCount === service.desiredCount
    );
  } catch (error) {
    console.error('Error checking PostgreSQL service:', error);
    return false;
  }
}

async function deployPostgres() {
  try {
    // Build and tag the PostgreSQL image
    console.log('Building PostgreSQL image...');
    execSync(
      `docker build -t postgres:${stage} \
        --build-arg STAGE=${stage} \
        --build-arg POSTGRES_USER=${dbUser} \
        --build-arg POSTGRES_PASSWORD=${dbPassword} \
        --build-arg POSTGRES_DB=${dbName} \
        -f apps/backend/src/database/Dockerfile .`,
      { stdio: 'inherit' },
    );

    // Push to ECR (assuming ECR repository exists)
    console.log('Pushing to ECR...');
    const accountId = process.env.AWS_ACCOUNT_ID;
    const ecrRepo = process.env.AWS_ECR_DB_REPOSITORY;

    if (!accountId || !ecrRepo) {
      throw new Error('Missing AWS_ACCOUNT_ID or ECR_REPOSITORY_DATABASE');
    }

    const ecrUrl = `${accountId}.dkr.ecr.${region}.amazonaws.com`;
    execSync(
      `aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${ecrUrl}`,
      { stdio: 'inherit' },
    );
    execSync(`docker tag postgres:${stage} ${ecrUrl}/${ecrRepo}:${stage}`, {
      stdio: 'inherit',
    });
    execSync(`docker push ${ecrUrl}/${ecrRepo}:${stage}`, { stdio: 'inherit' });

    // Update ECS service
    console.log('Updating ECS service...');
    execSync(
      `aws ecs update-service --cluster ${ecsCluster} --service ${ecsService} --force-new-deployment --region ${region}`,
      { stdio: 'inherit' },
    );

    console.log('PostgreSQL deployment completed successfully');
  } catch (error) {
    console.error('Error deploying PostgreSQL:', error);
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
    !ecrRepositoryName ||
    !ecsCluster ||
    !ecsService ||
    !ecsTaskFamily ||
    !containerName
  ) {
    console.error('Missing required environment variables for AWS deployment');
    process.exit(1);
  }

  const running = await isPostgresRunning();

  if (running) {
    console.log('PostgreSQL is already running in ECS. Skipping deployment.');
    return;
  }

  console.log('PostgreSQL is not running in ECS. Starting deployment...');
  await deployPostgres();
}

main().catch((error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
