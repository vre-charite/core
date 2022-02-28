# Error Messages Documentation

Each object in this json is an api call that the frontend makes to get data, post data, update.

The error texts are arranged by status code, and a default text if a status code returned from the backend is not listed in the json file.

common status codes

- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 5xx Server Error

For more infomation about status code visit : https://www.restapitutorial.com/httpstatuscodes.html

## createProject

Create project call is done from landing and clicking modal

## login

User login

## resetPassword

reset password

## forgotPassword

forgot Password

## forgot Username

forgot username

## checkToken

This api is done from reset password email link to get user from a token

## resetForgottenPasword

This api is used when user submits form after getting a email about password reset

## refresh

Refresh modal api calls

## parseInviteHashAPI

This api is used from self registering

## uploadFileApi

This api is used when uploading files from a project

## uploadRequestFail

This api is used when a file uploading files

## traverseFoldersContainersAPI

From a dataset get all the folders

## getFilesByTypeAPI

This api is used from table component to get files by page, page size, search text

## selfRegistration

This api call is done when user submits self register form

## inviteUser

This api call is done when inviting a user to project and doesnt exist on platform

## checkEmailExistAPI

This api call is made to check when inviting a user to project, to see if they are already on platform

## checkUserPlatformRole

This api is called to check users platform role when adding a memeber to a project

## addUsertoDataSet

This api is made when inviting the user to platform after checking from `checkEmailExistAPI

## changeRoleInDataset

This api is made from the teams table when changing a role from the dropdown

## getUsersOnDataset

This api is made from the team tabls to get the list of users

## removeUserFromDataset

This api is made from the teams table when clicking remove from teams table

## getDataset

This api is used after login to get all the datasets

## listAllContainersPermission

this api is used to get the users permission for datasets

## contactUsAPI

This api is used when submitting the from the support panel

## inviteUserApi

This api is called when inviting user from platform users management

## editManifestOnFile
edit a single file's manifest attribute on Canvas

## updateFileManifestAPI
This api is called when updating a single file's manifest attribute on Canvas

## importExportManifest
Import and export manifest as a json for a project

## importManifestAPI
This api is called when importing a manifest from json