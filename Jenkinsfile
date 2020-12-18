pipeline {
    agent any
    environment {
      imagename_portal_dev = "10.3.7.221:5000/portal"
      imagename_bff_dev = "10.3.7.221:5000/bff"
      imagename_portal_staging = "10.3.7.241:5000/portal"
      imagename_bff_staging = "10.3.7.241:5000/bff"
      registryCredential = 'docker-registry'
      dockerImage = ''
    }

    stages {

    stage('Git clone for dev') {
        when {branch "k8s-dev"}
        steps{
          script {
          git branch: "k8s-dev",
              url: 'https://git.indocresearch.org/charite/core.git',
              credentialsId: 'lzhao'
            }
        }
    }

    stage('DEV Build and push portal image') {
      when {
          allOf {
              changeset "portal/**"
              branch "k8s-dev"
            }
      }
      steps{
        script {
            docker.withRegistry('http://10.3.7.221:5000', registryCredential) {
                customImage = docker.build("10.3.7.221:5000/portal:${env.BUILD_ID}",  "--build-arg PORTAL_ENV=build-dev ./portal")
                customImage.push()
            }
        }
      }
    }
    stage('DEV Remove portal image') {
      when {
          allOf {
              changeset "portal/**"
              branch "k8s-dev"
            }
      }
      steps{
        sh "docker rmi $imagename_portal_dev:$BUILD_NUMBER"
      }
    }

    stage('DEV Deploy portal') {
      when {
          allOf {
              changeset "portal/**"
              branch "k8s-dev"
            }
      }
      steps{
        sh "sed -i 's/<VERSION>/${BUILD_NUMBER}/g' kubernetes/dev-portal-deployment.yaml"
        sh "kubectl config use-context dev"
        sh "kubectl apply -f kubernetes/dev-portal-deployment.yaml"
      }
    }

    stage('DEV Building and push bff') {
      when {
          allOf {
              changeset "backend/**"
              branch "k8s-dev"
            }
      }
      steps{
        script {
            docker.withRegistry('http://10.3.7.221:5000', registryCredential) {
                customImage = docker.build("10.3.7.221:5000/bff:${env.BUILD_ID}", "./backend")
                customImage.push()
            }
        }
      }
    }

    stage('DEV Remove bff image') {
      when {
          allOf {
              changeset "backend/**"
              branch "k8s-dev"
            }
      }
      steps{
        sh "docker rmi $imagename_bff_dev:$BUILD_NUMBER"
      }
    }

    stage('DEV Deploy bff') {
      when {
          allOf {
              changeset "backend/**"
              branch "k8s-dev"
            }
      }
      steps{
        sh "sed -i 's/<VERSION>/${BUILD_NUMBER}/g' kubernetes/dev-bff-deployment.yaml"
        sh "kubectl config use-context dev"
        sh "kubectl apply -f kubernetes/dev-bff-deployment.yaml"
      }
    }

    stage('Git clone staging') {
        when {branch "k8s-staging"}
        steps{
          script {
          git branch: "k8s-staging",
              url: 'https://git.indocresearch.org/charite/core.git',
              credentialsId: 'lzhao'
            }
        }
    }

    stage('STAGING Building and push portal image') {
      when {
          allOf {
              changeset "portal/**"
              branch "k8s-staging"
            }
      }
      steps{
        script {
            docker.withRegistry('http://10.3.7.241:5000', registryCredential) {
                customImage = docker.build("10.3.7.241:5000/portal:${env.BUILD_ID}", "--build-arg PORTAL_ENV=build-staging ./portal")
                customImage.push()
            }
        }
      }
    }

    stage('STAGING Remove portal image') {
      when {
          allOf {
              changeset "portal/**"
              branch "k8s-staging"
            }
      }
      steps{
        sh "docker rmi $imagename_portal_staging:$BUILD_NUMBER"
      }
    }

    stage('STAGING Deploy portal') {
      when {
          allOf {
              changeset "portal/**"
              branch "k8s-staging"
            }
      }
      steps{
        sh "sed -i 's/<VERSION>/${BUILD_NUMBER}/g' kubernetes/staging-portal-deployment.yaml"
        sh "kubectl config use-context staging"
        sh "kubectl apply -f kubernetes/staging-portal-deployment.yaml"
      }
    }

    stage('STAGING Building and push bff image') {
      when {
          allOf {
              changeset "backend/**"
              branch "k8s-staging"
            }
      }
      steps{
        script {
            docker.withRegistry('http://10.3.7.241:5000', registryCredential) {
                customImage = docker.build("10.3.7.241:5000/bff:${env.BUILD_ID}", "./backend")
                customImage.push()
            }
        }
      }
    }

    stage('STAGING Remove bff image') {
      when {
          allOf {
              changeset "backend/**"
              branch "k8s-staging"
            }
      }
      steps{
        sh "docker rmi $imagename_bff_staging:$BUILD_NUMBER"
      }
    }

    stage('STAGING Deploy bff') {
      when {
          allOf {
              changeset "backend/**"
              branch "k8s-staging"
            }
      }
      steps{
        sh "sed -i 's/<VERSION>/${BUILD_NUMBER}/g' kubernetes/staging-bff-deployment.yaml"
        sh "kubectl config use-context staging"
        sh "kubectl apply -f kubernetes/staging-bff-deployment.yaml"
      }
    }
  }
}
