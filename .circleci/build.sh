#!/bin/bash -eo pipefail

if [[ "${CIRCLE_BRANCH}" == "develop" ]] || [[ "${CIRCLE_BRANCH}" == "master" ]]; then
    gulp build --production --vendor=chrome
    gulp pack --vendor=chrome
fi
