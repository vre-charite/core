import React from 'react';
import { Card, Button, Typography, Collapse, Breadcrumb } from 'antd';
const { Title } = Typography;
const { Panel } = Collapse;

function SupportCollapse(props) {
  const callback = (v) => {
    console.log(v);
  };
  return (
    <>
      <p id="account">
        <strong>Account Information</strong>
      </p>
      <Collapse onChange={callback}>
        <Panel
          header="I forgot my username or password. What should I do?"
          key="1"
        >
          <p>
            Please contact the VRE Support Team at vre-support@charite.de for
            assistance with changing your username or password
          </p>
        </Panel>
        <Panel header="How can I change my password?" key="2">
          <p>
            After logging in, click on your username in the top right corner of
            any page and select &ldquo;Reset Password&rdquo;.
          </p>
        </Panel>
        <Panel header="How can I change my email address?" key="3" id="3">
          <p>
            Your email address is associated with your approved membership in
            one or more VRE research projects and is your identity throughout
            the platform. To change your email address, you will need to request
            a new user account from your Project Administrator.
          </p>
        </Panel>
      </Collapse>
      <br />
      <p id="projects">
        <strong>Projects</strong>
      </p>
      <Collapse onChange={callback}>
        <Panel
          header="What is my role and what are the different user roles within a Project?"
          key="4"
        >
          <p>
            Your user role is displayed in the Project Canvas in the Project
            Information Card, beside the Project Name. The available user roles
            are as follows:
          </p>
          <ul>
            <li>
              <strong>Administrator</strong>: The Project Administrator, a
              Principal Investigator or delegate who has overall responsibility
              under GDPR as Data Controller for the project data and has the
              authority to invite other research members to the project.
              Administrators can view all project data, modify project
              information, and add additional users to the project.
            </li>
            <li>
              <strong>Contributor</strong>: A member of the project invited by
              the Administrator. Users with the Contributor role can upload data
              to the project, view the list of files they uploaded using the
              File Explorer, and download the files they uploaded. Contributor
              users cannot browse or download data added by another user.
            </li>
          </ul>
        </Panel>
        <Panel header="What is a Project?" key="5">
          <p>
            A Project is a data storage and processing container that holds all
            the data files for a VRE-approved research project. VRE-approved
            means that the research project has been assessed by the Charite VRE
            Governance Manager and Data Protection Officer as having all the
            necessary approvals and safeguards in place for data processing to
            occur in the VRE.
          </p>
        </Panel>
        <Panel
          header="What is the difference between Project Code and Project Name?"
          key="6"
        >
          <p>
            The Project Code is a persistent character-based code created by the
            VRE Onboarding Team that uniquely identifies the Project in the VRE.
            Once created, it cannot be changed. The Project Name is a
            user-friendly, descriptive title that makes it easier for users to
            find the Project in the VRE. The Project Name can only be changed by
            the project Administrator.
          </p>
        </Panel>
        <Panel
          header="What is Project Visibility and how can I change it?"
          key="7"
        >
          <p>
            Visibility is a Project attribute that controls whether a
            Project&rsquo;s basic information (Project Title, Project Code and
            description) are visible to all VRE users in the Landing Page.
            Visibility does not affect which users can be added to a Project.
          </p>
          <p>
            The Visibility of a Project is controlled by the Administrator and
            can be edited on the Project Information page by selecting or
            deselecting the checkbox &ldquo;Make this project discoverable by
            all platform users&rdquo;. If the checkbox is selected, any user
            logged into the VRE can see the Project&rsquo;s Title, Code, and
            description in the VRE landing page, but only invited Team Members
            can enter the Project. If the option is deselected, no users outside
            of the invited Project Team Members will be able to see the Project
            in the Landing Page.
          </p>
        </Panel>
        <Panel
          header="What is the Members Panel and who can access it?"
          key="8"
        >
          <p>
            The Members Panel is used to add users to a Project. Project and
            Portal Administrators can access the Members Panel in the right
            Sidebar.
          </p>
        </Panel>
      </Collapse>
      <br />
      <p id="security">
        <strong>Site security</strong>
      </p>
      <Collapse onChange={callback}>
        <Panel
          header=" Why do I receive warnings that my session will expire?"
          key="9"
        >
          <p>
            The platform detects users that have been inactive for five or more
            minutes. This is done for security reasons and to help increase
            overall speed of the platform. Before expiring inactive sessions,
            the VRE will warn you. To confirm that your session is active, click
            &ldquo;Refresh&rdquo;. If your session has expired, you will be
            required to log back in with your username and password.
          </p>
        </Panel>
      </Collapse>
      <br />
      <p id="file">
        <strong>File upload</strong>
      </p>
      <Collapse>
        <Panel header="Who can upload a data file to the VRE?" key="10">
          <p>
            A file can only be uploaded into an approved Project by an invited
            Project Member (Administrator or Contributor). As an invited Project
            Member of the Project, you have been authorized to contribute data
            to the project. All VRE members are responsible for abiding by the
            Platform Terms of Use and all Project Members must ensure that they
            only upload authorized data that is appropriate to the Project.
            Please contact your Project Administrator if you believe you should
            have a different user role.
          </p>
        </Panel>
        <Panel header="How do I upload a file?" key="11">
          <p>
            After logging into the VRE, navigate to your Project and click on
            Upload in the File Explorer card or click on the Upload icon in the
            Right Sidebar. You can select one or multiple files from your local
            drive to upload to the VRE.
          </p>
        </Panel>
        <Panel header="How do I know my file uploaded successfully?" key="12">
          <p>
            The Files Panel will appear in the bottom right of your screen after
            you initiate a file upload. Your most recent upload will appear at
            the bottom of the list and will have a green &ldquo;Success&rdquo;
            indicator if uploaded successfully. If you need to open or close the
            Files Panel, click on the Files Panel icon at the bottom of the
            Right Sidebar. Files will be listed as &ldquo;Uploading&rdquo; if
            the upload is in progress, &ldquo;Success&rdquo; if the file was
            uploaded without issue, or &ldquo;Error&rdquo; if the attempted
            upload was unsuccessful.
          </p>
        </Panel>
        <Panel header="Are files encrypted upon upload?" key="13">
          <p>
            SSR encryption is applied to all data uploaded to the VRE Portal
            both at rest and in transit.
          </p>
        </Panel>
      </Collapse>
    </>
  );
}

export default SupportCollapse;
