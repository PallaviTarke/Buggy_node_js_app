# Buggy_node_js_app

# Buggy Node.js App with Snyk and GitLab CI/CD

This project is a Node.js application with intentional code vulnerabilities and configuration issues, designed to demonstrate static code analysis using **Snyk Code** integrated with **GitLab CI/CD**. It includes a **Docker** setup for containerization and a pipeline that runs tests, Snyk scans, and Docker image building.

## Project Overview
The app is a simple Express server that serves an HTML page. It contains deliberate bugs (e.g., deprecated methods, unused variables) to be detected by Snyk. The GitLab CI/CD pipeline automates testing, Snyk Code and dependency scans, and Docker image building/pushing to the GitLab Container Registry.

## Tech Stack

- Backend: Node.js, Express
- Frontend: Static HTML, CSS
- Testing: Jest, Supertest
- Containerization: Docker
- CI/CD: GitLab CI/CD
- Code Quality & Security: Snyk Code
- Deployment Target: Ubuntu VM (IP: 3.90.18.73, user: Ubuntu)

## File Structure
```
buggy-node-app/
├── app.js                # Main Express app with intentional bugs
├── index.html            # Simple HTML page served by the app
├── package.json          # Project metadata and dependencies
├── Dockerfile            # Docker configuration for production
├── .dockerignore         # Excludes files from Docker build
├── .gitlab-ci.yml        # GitLab CI/CD pipeline configuration
└── tests/
    └── app.test.js       # Basic Jest/Supertest for testing
```

## Intentional Bugs
The `app.js` file includes the following issues for Snyk Code to detect:
- **Unused import**: `const fs = require('fs');` is imported but never used.
- **Duplicate middleware**: `app.use(express.static('public'));` is declared twice.
- **Console.log in production**: `console.log("App is starting...");` should be avoided.
- **Deprecated method**: `res.sendfile()` (lowercase `f`) is used instead of `res.sendFile()`.
- **Unused variable**: `const unused = "I'm not used";` is declared but unused.
- **Magic number**: `3000` is hardcoded as the default port without explanation.

The `package.json` uses loose dependency versions (e.g., `^4.18.2`), which may lead to vulnerabilities detectable by Snyk Open Source.

## Prerequisites
- **Node.js**: Version 18.x
- **Docker**: For building and running containers
- **GitLab Account**: For CI/CD and Container Registry
- **Snyk Account**: For code and dependency scanning (get token from https://app.snyk.io/account)
- **Git**: For version control

## Setup Instructions

### 1. Clone or Create the Project
```bash
# Create and navigate to project directory
mkdir buggy-node-app && cd buggy-node-app

# Initialize Node.js app
npm init -y

# Install dependencies
npm install express
npm install --save-dev jest supertest

# Create project files
touch app.js index.html Dockerfile .dockerignore .gitlab-ci.yml
mkdir tests && touch tests/app.test.js
```

### 2. Add File Contents
Copy the following files into the project (refer to the provided code):
- `app.js`: Express app with intentional bugs.
- `index.html`: Simple HTML page.
- `package.json`: Project metadata with scripts and dependencies.
- `Dockerfile`: Docker setup for Node.js.
- `.dockerignore`: Excludes unnecessary files.
- `.gitlab-ci.yml`: GitLab pipeline for tests, Snyk, and Docker build.
- `tests/app.test.js`: Basic test for the root endpoint.


# nano app.js
```
const express = require('express');
const fs = require('fs'); // ❌ Unused import
const app = express();

// ❌ Duplicate middleware
app.use(express.static('public'));
app.use(express.static('public'));

// ❌ Console.log in production
console.log("App is starting...");

// ❌ Deprecated API
app.get('/deprecated', (req, res) => {
  res.sendfile(__dirname + '/index.html'); // should be sendFile
});

app.get('/', (req, res) => {
  const unused = "I'm not used"; // ❌ Unused variable
  res.sendFile(__dirname + '/index.html');
});

// ❌ Magic number
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

```
# nano package.json
```
{
  "name": "buggy-node-app",
  "version": "1.0.0",
  "description": "Node.js app with intentional bugs for Snyk Code test",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "test": "jest --coverage"
  },
  "author": "You",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}

```
# nano index.html
```
<!DOCTYPE html>
<html>
  <head><title>Buggy App</title></head>
  <body><h1>Buggy Node.js App</h1></body>
</html>
```

# nano tests/app.test.js
```
const request = require('supertest');
const app = require('../app');

describe('GET /', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });
});

```

# nano Dockerfile
```
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]


# nano .gitlab-ci.yml

stages:
  - build
  - test
  - snyk

cache:
  paths:
    - node_modules/

before_script:
  - apt-get update && apt-get install -y curl
  - curl -sL https://deb.nodesource.com/setup_18.x | bash -
  - apt-get install -y nodejs
  - npm install -g snyk
  - npm ci

docker_build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:latest .
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main  

test:
  stage: test
  script:
    - npm run test

snyk_code_scan:
  stage: snyk
  script:
    - snyk auth "${SNYK_TOKEN}"
    - snyk code test

snyk_dep_scan:
  stage: snyk
  script:
    - snyk auth "${SNYK_TOKEN}"
    - snyk test

```

### Step 4: Set Up Snyk Code

- Create a Snyk Account:
- Sign up at https://snyk.io.
- Generate an API Token:
- Go to Account Settings > General, copy the API token, and add it as a GitLab CI/CD variable:
- Key: SNYK_TOKEN
- Value: Your Snyk API token
- Type: Variable (masked)

### 5. Run Locally
```bash
# Run the app
node app.js
```
Visit `http://localhost:3000` in your browser.

### 6. Run Tests
```bash
npm run test
```

### 7. Run Snyk Scans Locally (Optional)
```bash
# Install Snyk globally
npm install -g snyk

# Authenticate with Snyk
snyk auth

# Run Snyk Code scan (source code)
snyk code test

# Run Snyk Open Source scan (dependencies)
snyk test
```

### 8. Build and Run with Docker (Optional)

# Install Docker:
ssh ubuntu@3.90.18.73
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

```bash
# Build Docker image
docker build -t buggy-node-app .

# Run Docker container
docker run -p 3000:3000 buggy-node-app
```
Visit `http://localhost:3000`.

### 9. Push to GitLab
```bash
# Initialize Git
git init
git add .
git commit -m "Initial buggy app with Snyk and Docker"

# Add GitLab repo (replace YOUR-USERNAME and YOUR-REPO)
git remote add origin https://gitlab.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

### 10. Configure GitLab CI/CD Variables
1. Go to your GitLab repository.
2. Navigate to **Settings > CI/CD > Variables > Add Variable**.
3. Add:
   - **Key**: `SNYK_TOKEN`, **Value**: `Your Snyk token from https://app.snyk.io/account.`
   - **Key**: `CI_REGISTRY_USER`, **Value**: `Your GitLab username.`
   - **Key**: `CI_REGISTRY_PASSWORD`, **Value**: `A GitLab personal access token with `api` and `write_repository` scopes (create at **User Settings > Access Tokens**).`
   - **Key**: `CI_REGISTRY`, **Value**: `registry.gitlab.com`.
   - **Key**: `CI_REGISTRY_IMAGE`, **Value**: `registry.gitlab.com/YOUR-USERNAME/YOUR-REPO`.
   - **Key**: `DOCKER_USER`, **Value**: `Your Docker Hub username.`
   - **Key**: `DOCKER_PASS`, **Value** : `Your Docker Hub password or token (protected).`
   - **Key**: `SNYK_TOKEN`, **Value**: `Snyk API token (protected).`
   - **Key**: `SSH_PRIVATE_KEY` **Value**: `Contents of ~/.ssh/nodejs_app_key (protected).`
   - **Key**:`DEPLOY_SERVER:` **Value**:`3.90.18.73.`
   - **Key**:`DEPLOY_USER:` **Value**: `Ubuntu.`
   - **Key**:`SSH_KNOWN_HOSTS`: **Value**: Output of ssh-keyscan `3.90.18.73`

## CI/CD Pipeline
The `.gitlab-ci.yml` defines three stages:
1. **Test Stage**:
   - Job: `test`
   - Runs: `npm run test` (Jest tests with Supertest).
2. **Snyk Stage**:
   - Job: `snyk_code_scan`
     - Runs: `snyk code test` to detect code issues (e.g., deprecated methods, unused variables).
   - Job: `snyk_dep_scan`
     - Runs: `snyk test` to check for dependency vulnerabilities.
3. **Build Stage**:
   - Job: `docker_build`
     - Builds Docker image and pushes to GitLab Container Registry.
     - Runs only on the `main` branch.
     - Uses `docker:dind` service for Docker-in-Docker.

To view pipeline results:
1. Go to **CI/CD > Pipelines** in GitLab.
2. Check logs for `test`, `snyk_code_scan`, `snyk_dep_scan`, and `docker_build`.
3. View the Docker image in **Packages & Registries > Container Registry**.

## Snyk Integration
Snyk is integrated via the `snyk_code_scan` and `snyk_dep_scan` jobs:
- **Snyk Code**: Detects issues in `app.js` (e.g., unused imports, deprecated `sendfile`).
- **Snyk Open Source**: Scans `package.json` dependencies for known vulnerabilities.
- Requires `SNYK_TOKEN` in GitLab CI/CD variables.

## Docker Setup
- **Dockerfile**: Uses `node:18` base image, installs dependencies, and runs `npm start`.
- **.dockerignore**: Excludes `node_modules`, `coverage`, `.git`, and `.gitlab-ci.yml` to optimize the image.
- The `docker_build` job pushes the image to `registry.gitlab.com/YOUR-USERNAME/YOUR-REPO:latest`.

## Troubleshooting
- **Pipeline fails on Snyk jobs**: Verify `SNYK_TOKEN` is correctly set in GitLab.
- **Docker build fails**: Ensure `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD`, `CI_REGISTRY`, and `CI_REGISTRY_IMAGE` are configured.
- **Tests fail**: Check `tests/app.test.js` and ensure `supertest` is installed.
- **Local Snyk errors**: Run `snyk auth` and ensure you have a valid Snyk account.

## License
This project is unlicensed and intended for demonstration purposes only.

![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)


## Snyk Features #  

The free Snyk Code platform provides robust security tools for developers, with limited access to additional products like Snyk Open Source, Snyk Container, and Snyk Infrastructure as Code (IaC). Below are the key features available in the free tier, tailored to this project’s Node.js application:

# Snyk Code: 
A Static Application Security Testing (SAST) tool that scans source code for vulnerabilities in real time, supports JavaScript (used in app.js), offers AI-driven fixes (DeepCode AI Fix), and integrates with GitLab CI/CD for automated pull request (PR) checks.

# Snyk Open Source: 
Scans dependencies in package.json for known vulnerabilities, leveraging Snyk’s comprehensive vulnerability database, and provides actionable fix advice.

# Integration: 
Seamless integration with GitLab pipelines (via .gitlab-ci.yml) and support for CLI commands (snyk code test, snyk test).
Speed and Accuracy: Fast scans with low false positives, prioritizing critical issues.
Developer-Friendly: Provides in-line remediation suggestions and detailed reports to fix issues like deprecated methods or unused variables.

# Contributing Developers:
 Supports individual developers or small teams committing to private repositories monitored by Snyk (contributions to public repos are excluded). The free tier allows up to 100 Snyk Code scans per month for private repos and unlimited tests for public repos, ideal for small projects like this one. Developers committing to app.js or package.json are tracked as contributors.

# Snyk Infrastructure as Code (IaC): 
Scans IaC configurations (e.g., Terraform, Kubernetes, CloudFormation) for misconfigurations, with up to 100 tests/month in the free tier. While this project doesn’t include IaC files, you can extend it to scan Docker-related Kubernetes manifests (e.g., yaml files) using snyk iac test /path/to/file.yaml. Automated PR fixes for IaC are not available in the free tier.

# Snyk Container: 
Scans container images (e.g., Docker images built from Dockerfile) for vulnerabilities, with up to 100 tests/month in the free tier. You can scan the project’s image locally with snyk container test buggy-node-app:latest. Basic vulnerability detection is supported, but advanced runtime monitoring requires a paid plan.

# Security & Compliance: 
Detects vulnerabilities in source code (app.js) and dependencies (package.json) using Snyk’s Intel Vulnerability Database, which covers JavaScript and npm packages. Basic license compliance checks ensure dependencies meet open-source licensing requirements. The free tier provides limited compliance reporting via the Snyk Web UI (app.snyk.io), sufficient for small projects but lacking advanced frameworks (e.g., SOC2) available in paid plans.

# Plugins & Integrations: 
Integrates with developer tools via the Snyk CLI, supporting IDEs (e.g., VS Code, JetBrains), SCMs (e.g., GitLab, GitHub), and CI/CD pipelines (e.g., GitLab CI/CD, as used in .gitlab-ci.yml). The free tier enables CLI commands (snyk code test, snyk test) and GitLab integration for automated scans on commits. IDE plugins provide real-time feedback during coding.

# Automation (Automatic and Manual Fixes): 
Snyk Code uses DeepCode AI Fix to suggest manual fixes for code issues (e.g., replacing sendfile with sendFile) in the Snyk Web UI or CLI output. Snyk Open Source supports automatic pull requests for dependency upgrades (e.g., patching vulnerable express versions) in GitLab. The free tier includes these features, but advanced automation (e.g., for IaC or container fixes) is limited to paid plans.

# Management & Reporting: 
Provides basic reporting via the Snyk Web UI, showing vulnerability severity (Critical, High, Medium, Low) and fix advice for app.js and package.json. Reports are accessible after running snyk code test or snyk test in the pipeline. The free tier lacks advanced management features like centralized policy governance or custom reports, which are Enterprise-tier only.

# Free Tier Limitations: 
The free tier caps scans at 100/month for Snyk Code, Container, and IaC, with unlimited tests for public repos. Advanced features like Snyk AppRisk, SSO, and comprehensive compliance frameworks require paid plans (Team or Enterprise). For this project, the free tier is sufficient for scanning app.js and package.json, but users must monitor scan usage for private repos.

These features enable developers to secure the application efficiently, catching issues like those intentionally included in app.js (e.g., deprecated methods, unused variables) and package.json (e.g., vulnerable dependencies).

# Snyk Integration
Snyk is integrated via the snyk_code_scan and snyk_dep_scan jobs in .gitlab-ci.yml:
-Snyk Code: Detects issues in app.js (e.g., unused imports, deprecated sendfile).
-Snyk Open Source: Scans package.json dependencies for known vulnerabilities.
-Requires SNYK_TOKEN in GitLab CI/CD variables.

# Docker Setup
-Dockerfile: Uses node:18 base image, installs dependencies, and runs npm start.
-.dockerignore: Excludes node_modules, coverage, .git, and .gitlab-ci.yml to optimize the image.
-The docker_build job pushes the image to registry.gitlab.com/YOUR-USERNAME/YOUR-REPO:latest.

# Troubleshooting
-Pipeline fails on Snyk jobs: Verify SNYK_TOKEN is correctly set in GitLab.
-Docker build fails: Ensure CI_REGISTRY_USER, CI_REGISTRY_PASSWORD, CI_REGISTRY, and CI_REGISTRY_IMAGE are configured.
-Tests fail: Check tests/app.test.js and ensure supertest is installed.
-Local Snyk errors: Run snyk auth and ensure a valid Snyk account.
-Scan limits exceeded: Monitor usage in the Snyk Web UI; consider upgrading to a paid plan for more scans.

License
