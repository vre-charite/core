import React from 'react';
import { Button, Checkbox, message, Modal, Typography } from 'antd';

const { Title } = Typography;

function TermsOfUseModal(props) {
  return (
    <Modal
      title="Platform Terms of Use Agreement"
      visible={props.visible}
      onOk={props.handleOk}
      onCancel={props.handleCancel}
      width={'70%'}
      // bodyStyle={{ maxHeight: '68vh', overflow: 'scroll' }}
      footer={props.footer}
      maskClosable={false}
      zIndex="1020"
    >
      <div
        style={{ overflowY: 'scroll', height: '60vh' }}
        onScroll={props.handleScroll}
      >
        <ul>
          <li>
            <a href="#top">Data Protection Statement</a>
            <ol>
              <li>
                <a href="#first">Definitions</a>
              </li>
              <li>
                <a href="#second">
                  Name and contact details of the data protection officer
                </a>
              </li>
            </ol>
          </li>
          <li>
            <a href="#cookies" id="cookies-link">
              Cookies Policy
            </a>
          </li>
        </ul>
        <Title level={3} id="top">
          Data Protection Statement
        </Title>
        <p>
          Thank you for your interest in our company. Data protection is of the
          utmost importance to Charité – Universitätsmedizin Berlin. It is
          generally possible to use our website without having to provide any
          personal data. However, if a data subject wishes to use our website to
          access specific services offered by our company, the processing of
          personal data may become necessary. If it is necessary to process
          personal data, and there is no legal basis for such processing, we
          will generally obtain the data subject’s consent.
        </p>
        <p>
          The processing of personal data, such as a data subject's name,
          address, email address or telephone number, shall always be performed
          in accordance with the General Data Protection Regulation (“GDPR”) and
          in compliance with the country-specific data protection regulations
          applicable to Charité – Universitätsmedizin Berlin. The aim of our
          organization’s data protection statement is to inform the general
          public of the nature, scope and purpose of the personal data we
          collect, use and process. This data protection statement also informs
          data subjects of the rights to which they are entitled.
        </p>
        <p>
          As the data controller, Charité – Universitätsmedizin Berlin has
          implemented numerous technical and organizational measures to ensure
          that personal data processed via this website enjoy the most
          comprehensive protection possible. However, due to some of the
          security vulnerabilities inherent in data transfer via the internet,
          complete protection cannot be guaranteed. For this reason, data
          subjects are free to choose alternative means (e.g. via telephone) by
          which to transfer their personal data.
        </p>
        <Title level={4} id="first">
          1. Definitions
        </Title>
        <p>
          Charité – Universitätsmedizin Berlin’s data protection statement uses
          the terms adopted by the European legislator for the purposes of the
          GDPR.
        </p>
        <Title level={4} id="second">
          2. Name and contact details of the data protection officer
        </Title>
        <p>
          For the purposes of the GDPR, other data protection laws applicable to
          Member States of the European Union and other provisions relating to
          the subject of data protection, the controller is:
        </p>
        <p>
          Charité – Universitätsmedizin Berlin Charitéplatz 1 <br />
          10117 Berlin
          <br />
          Deutschland
        </p>
        <p>+49 30 450 50</p>
        <p>
          <a href="mailto:datenschutz@charite.de">datenschutz(at)charite.de</a>
        </p>
        <p>
          Website: <a href="https://www.charite.de">https://www.charite.de</a>
        </p>
        <p>
          <strong>Data Protection Officer</strong>
        </p>
        <p>
          For any questions on the processing of your personal data or on your
          rights under data protection law, please contact:
        </p>
        <p>
          Datenschutz der Charité – Universitätsmedizin Berlin <br />
          Charitéplatz 1<br />
          10117 Berlin
        </p>
        <p>+49 30 450 580 016</p>
        <p>
          <a href="mailto:datenschutz@charite.de">datenschutz(at)charite.de</a>
        </p>
        <p>
          You can contact us via the contact details provided in Section 2 of
          this Data Protection Statement.
        </p>
        <Title level={3} id="cookies">
          Cookies Policy
        </Title>
        <p>
          We use <strong>following strictly necessary cookies</strong> to fulfil
          the site functionality. These are not tracking cookies.
        </p>
        <p>
          <strong>Access token</strong> :<br /> An encoded token that is used to
          mark user's identity and access to services.
        </p>
        <p>
          <strong>Refresh token</strong>: <br />
          An encoded token that is used to refresh user's session.
        </p>
        <p>
          <strong>Username</strong> : <br />
          Username of the current user.
        </p>
        <p>
          <strong>Login status</strong> :<br /> A boolean that marks whether a
          user is logged in.
        </p>
        {/* <p>
          <strong>Cookies notification</strong> : A boolean that marks whether a
          user has seen the cookies notification.
        </p> */}
        <br />
        <p>Explainations about other cookies, if any.</p>
        <p>The site is currently using following cookies:</p>
        <Checkbox checked={true} disabled={true}>
          Strictly necessary cookies
        </Checkbox>
        <br />
        <br />
      </div>
    </Modal>
  );
}

export default TermsOfUseModal;
