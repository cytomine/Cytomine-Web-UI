node {
    stage 'Retrieve sources'
    checkout([
        $class: 'GitSCM',  branches: [[name: 'refs/heads/'+env.BRANCH_NAME]],
        extensions: [[$class: 'CloneOption', noTags: false, shallow: false, depth: 0, reference: '']],
        userRemoteConfigs: scm.userRemoteConfigs,
    ])

    stage 'Clean'
    sh 'rm -rf ./ci'
    sh 'mkdir -p ./ci'

    stage 'Compute version name'
    sh 'scripts/ciBuildVersion.sh ${BRANCH_NAME}'

    withFolderProperties{
        // if PRIVATE is define in jenkins, the war and the docker image are send to the private cytomine repository.
        // otherwise, public repo for war and public dockerhub repo for docker image
        echo("Private: ${env.PRIVATE}")

        if (env.PRIVATE && env.PRIVATE.equals("true")) {
            stage 'Build docker image (private)'
            withCredentials(
                [
                    usernamePassword(credentialsId: 'CYTOMINE_DOCKER_REGISTRY', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_TOKEN')
                ]
                ) {
                    docker.withRegistry('http://repository.cytom.in:5004/v2/', 'CYTOMINE_DOCKER_REGISTRY') {
                        sh 'scripts/ciBuildDockerImagePrivate.sh ${BRANCH_NAME}'
                    }
                }
        } else {
              stage 'Build docker image'
              withCredentials(
                  [
                      usernamePassword(credentialsId: 'DOCKERHUB_CREDENTIAL', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_TOKEN')
                  ]
                  ) {
                      docker.withRegistry('https://index.docker.io/v1/', 'DOCKERHUB_CREDENTIAL') {
                          sh 'scripts/ciBuildDockerImage.sh ${BRANCH_NAME}'
                      }
                  }
              }
    }


}
