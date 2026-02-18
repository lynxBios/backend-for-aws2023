# AWS Cloud Developer - Backend Implementation ☁️🚀

This repository contains a comprehensive backend application built on **AWS (Amazon Web Services)**. The project follows a microservices and serverless architecture, covering everything from basic cloud infrastructure to advanced containerization and authorization patterns.

## 🌟 Key Highlights
* **Architecture:** Monolith to Serverless evolution.
* **Infrastructure as Code (IaC):** Hands-on experience with AWS CLI and automated deployments.
* **Scalability:** Implementation of async communication between microservices.

---

## 📚 Course Curriculum & Implementation

The project is structured into 10 specialized modules, each covering a critical aspect of cloud development:

### 1. Cloud Fundamentals & IAM
* Infrastructure-as-Code (IaC) principles.
* Monolith vs. Microservices vs. Serverless comparison.
* Setting up IAM users, policies, and CloudWatch monitoring.

### 2. Serving SPA (Single Page Applications)
* Static hosting using **AWS S3**.
* Global content delivery via **AWS CloudFront**.
* Automated deployment workflows.

### 3. Serverless API
* Developing and deploying **AWS Lambda** functions.
* Log collection and debugging with CloudWatch.
* Lambda advanced configuration.

### 4. NoSQL Database Integration
* Storing data in the cloud using **AWS DynamoDB**.
* Implementing CRUD operations within a serverless environment.

### 5. Advanced S3 Integration
* Deep dive into S3 Storage Classes and Lifecycle Management.
* S3 Access Control, Encryption, and Versioning.
* Triggering Lambda functions via S3 Events.

### 6. Async Microservices Communication
* Asynchronous messaging patterns.
* Integration of **AWS SQS** (Simple Queue Service) and **AWS SNS** (Simple Notification Service).

### 7. Authorization & Security
* Implementing Lambda Authorizers with **API Gateway**.
* User authentication via **AWS Cognito** (User Pools & Identity Pools).

### 8. SQL Database Integration
* Relational database management with **AWS RDS**.
* Connecting serverless functions to SQL engines.

### 9. Containerization
* **Docker** implementation: writing Dockerfiles and optimizing images.
* Deploying containers using **AWS Elastic Beanstalk**.

### 10. Backend For Frontend (BFF) Pattern
* Implementation of the **BFF Pattern** to optimize mobile/web interactions.
* Advanced API Gateway configuration as a BFF entry point.

---

## 🛠️ Tech Stack
* **Cloud Provider:** AWS (S3, CloudFront, Lambda, DynamoDB, RDS, SQS, SNS, Cognito, EB)
* **Language:** TypeScript / JavaScript
* **DevOps Tools:** Docker, AWS CLI
* **Monitoring:** AWS CloudWatch

---
*Completed as part of the AWS Cloud Developer program (https://github.com/rolling-scopes-school/aws/tree/main/aws-developer)*



## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

The `cdk.json` file tells the CDK Toolkit how to execute your app.
