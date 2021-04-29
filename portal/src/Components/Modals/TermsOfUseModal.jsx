import React from 'react';
import { Modal, Typography } from 'antd';
import styles from './terms.module.scss';
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
      className={styles.terms_modal}
    >
      <div
        style={{ overflowY: 'scroll', height: '60vh' }}
        onScroll={props.handleScroll}
      >
        <h1 style={{ textAlign: 'center' }}>
          VRE Website Privacy Policy (Draft)
        </h1>
        <h5 style={{ textAlign: 'center' }}>Version 1.0</h5>

        <h2 style={{ color: '#3b5991', marginTop: 20 }}>Table of Contents</h2>
        <ol>
          <li>
            <a href="#first">Use of Cookies by the VRE</a>
          </li>
          <li>
            <a href="#second">VRE Privacy Policy</a>
          </li>
          <li>
            <a href="#third">Data Controllers for the VRE website</a>
          </li>
          <li>
            <a href="#four">VRE Data Protection Officer (DPO)</a>
          </li>
          <li>
            <a href="#five">Legal Basis</a>
          </li>
          <li>
            <a href="#six">Non-VRE Services</a>
          </li>
          <li>
            <a href="#seven">Data Shared within the VRE Consortium</a>
          </li>
          <li>
            <a href="#eight">Data Shared between Research Partners and VRE</a>
          </li>
          <li>
            <a href="#nine">Data Shared with Third Parties</a>
          </li>
          <li>
            <a href="#ten">Transfers of the personal data to third countries</a>
          </li>
          <li>
            <a href="#eleven">Retention periods for the personal data</a>
          </li>
          <li>
            <a href="#twlve">Rights available to individuals</a>
          </li>
          <li>
            <a href="#thirteen">
              Right to lodge a complaint with a supervisory authority
            </a>
          </li>
        </ol>

        <Title level={4} id="first">
          1 Use of Cookies by the VRE
        </Title>
        <p>
          Cookies are small text files placed on your computer. Some cookies are
          functional session cookies which are used to provide the user with the
          experience of a session: e.g. they track login details, remember user
          choices and preferences, and in some instances determine site
          permissions. Other cookies are used to provide statistics: e.g. they
          provide, in anonymous form, the number of visitors accessing a
          website, features users access during website visits, and the general
          location of the user based on IP address.
        </p>
        <p>
          This VRE website uses only strictly necessary cookies — these cookies
          are essential for the proper operation of the website, allowing you to
          browse the website and use its features such as accessing secure areas
          of the site. This website protects your privacy by not creating
          cookies which contain personal data. The following list describes the
          types of cookies used on the VRE website.
        </p>
        <p>
          <ul>
            <li>
              <strong>Access token: </strong>
              <span>
                An encoded token that is used to mark user's identity and access
                to services.
              </span>
            </li>

            <li>
              <strong>Refresh token: </strong>
              <span>
                An encoded token that is used to refresh user's session.
              </span>
            </li>

            <li>
              <strong>Username: </strong>
              <span>Username of the current user.</span>
            </li>

            <li>
              <strong>Login status: </strong>
              <span>
                {' '}
                Indicates whether or not a user is logged into the VRE.
              </span>
            </li>

            <li>
              <strong>Terms of Use Notification: </strong>
              <span>
                {' '}
                Indicates whether or not a user has acknowledged the applicable
                Terms of Use and Privacy Policy notifications.
              </span>
            </li>
          </ul>
        </p>

        <Title level={4} id="second">
          2 VRE Privacy Policy
        </Title>
        <p>
          The VRE is a research infrastructure developed by the Charité and its
          service partners.
        </p>
        <p>
          For more information on Data Protection across the project, visit:
        </p>
        <p>
          <a href="https://www.charite.de/en/service/data_protection/">
            https://www.charite.de/en/service/data_protection/
          </a>
        </p>
        <p>
          At present, the Data Protection needs for the VRE are served by the
          Charité Data Protection Officer.
        </p>

        <Title level={4} id="third">
          3 Data Controllers for the VRE website
        </Title>
        <p>
          The Charité is the coordinating centre for the VRE Research
          Infrastructure and is the data controller for the personal information
          processed on the VRE Public Website (https://www.xxxxxx.de), unless
          otherwise stated. Charité’s legal address is: Charité –
          Universitätsmedizin Berlin, Charitéplatz 1, 10117 Berlin, Deutschland.
        </p>
        <p>
          Charité is neither data controller nor in charge of third party
          embedded content.
        </p>
        <p>
          All concerns regarding this VRE website, including ethical or data
          protection issues in the VRE, can be submitted to the Data Protection
          Officer of the Charite here: <br></br>
          <a href="https://www.charite.de/en/service/data_protection/">
            https://www.charite.de/en/service/data_protection/
          </a>
        </p>

        <Title level={4} id="four">
          4 VRE Data Protection Officer (DPO)
        </Title>
        <p>
          To contact the VRE Data Protection Officer directly, please send an
          email to the following address
          <a href="mailto:datenschutz@charite.de">datenschutz@charite.de</a>
        </p>

        <Title level={4} id="five">
          5 Legal Basis
        </Title>
        <p>The legal basis for data processing in this VRE website include:</p>
        <p>
          <ul>
            <li>Consent given by the Data Subject (GDPR Art. 6(1)(a))</li>
            <li>
              Necessity for the performance of a contract to which the Data
              Subject is a party, or for taking steps at the request of the Data
              Subject prior to entering a contract (GDPR Art. 6(1)(b)).{' '}
            </li>
            <li>
              Compliance with a legal obligation (GDPR Art. 6(1)(c)). For
              example, where the VRE partners are required to store the data to
              meet bookkeeping or audit obligations.
            </li>
            <li>
              Necessity for the performance of a task carried out in the public
              interest or in the exercise of official authority vested in the
              controller (GDPR Art. 6(1)(e)).
            </li>
            <li>
              If the VRE partners have a legitimate interest that is not
              overridden by the interests or fundamental rights freedoms of the
              Data Subject (GDPR Art. 6(1)(f)).
            </li>
          </ul>
        </p>
        <p>
          If you are employed by a VRE partner, your data will not be processed
          based on consent but rather to comply with a legal obligation, to
          perform a contract, or in some cases, for purposes of a legitimate
          interest
        </p>
        <p>
          This VRE website may process personal data that the Data Subject
          provides explicitly through account profile entry, login or other
          forms (e.g. contact forms, event registration, newsletter
          subscription). This includes required and optional fields entered by
          the Data Subject.
        </p>
        <p>
          Additionally, this VRE website logs the IP address used to access the
          website for security reasons.
        </p>
        <p>
          Personal data may be processed to provide access to services offered
          by the VRE website, to facilitate collaboration among users of the VRE
          website and to contact users to keep them informed of events and news
          regarding VRE.
        </p>

        <Title level={4} id="six">
          6 Non-VRE Services
        </Title>
        <p>
          This VRE website may receive support and services from providers
          outside of the Charité. If any personal data is transferred to these
          providers, the administrator of this website is required to consult
          the Charité Data Protection Officer to ensure that all data privacy
          obligations are met.
        </p>

        <Title level={4} id="seven">
          7 Data Shared within the VRE Consortium
        </Title>
        <p>
          The data controller may share data with VRE service providers within
          the VRE Consortium. All VRE partners are required by contract to meet
          all GDPR requirements. In some cases, VRE partners may publish
          statistical information about VRE usage, e.g. to the European
          Commission (EC). Such statistical information will always be
          anonymous.
        </p>
        <p>
          The data controller may also share data with official authorities if
          required by an administrative or courtorder, or with auditors.
        </p>

        <Title level={4} id="eight">
          8 Data Shared between Research Partners and VRE
        </Title>
        <p>
          The VRE receives data from its Research Partners as part of its
          operational function. This includes data from research institutions
          and data providers. The VRE will process this data in accordance with
          applicable EU laws such as the GDPR on privacy and data protection.
        </p>

        <Title level={4} id="nine">
          9 Data Shared with Third Parties
        </Title>
        <p>
          No personal data collected from this VRE website is sold or otherwise
          shared for the purposes of direct marketing or other commercial
          purposes.
        </p>

        <Title level={4} id="ten">
          10 Transfers of the personal data to third countries
        </Title>
        <p>
          Personal data may be transferred between the VRE service providers
          based in different countries. Personal data transfers may take place
          within the EU/EEA and to other countries that have been found to have
          adequate levels of protection by the European Commission including,
          but not limited to, Switzerland and Israel. All other personal data
          transfers are made with adequate safeguards in place including EC
          Standard Contractual Clauses, Binding Corporate Rules, or as part of
          the Privacy Shield Framework.
        </p>

        <Title level={4} id="eleven">
          11 Retention periods for the personal data
        </Title>
        <p>
          Cookies may be erased by the user at the end of each session. Some web
          browsers offer to do this automatically.
        </p>
        <p>
          Personal data entered by the Data Subject may be retained up to 2
          years after the lifetime of the VRE research infrastructure.
        </p>
        <p>
          Data Subjects may request erasure of their personal data to the VRE
          DPO. The data controller will execute such requests, except for
          minimal personal data which may be retained if needed for monitoring
          legal compliance. Backups may also be retained in case of legitimate
          interests of the data controller for the continued exploitation of the
          research infrastructure.
        </p>

        <Title level={4} id="twlve">
          12 Rights available to individuals
        </Title>
        <p>
          <ul>
            <li>
              The rights available to individuals, as provided in the General
              Data Protection regulation in respect of the processing their
              personal data, include:
            </li>
            <li>
              the right to be informed (GDPR Articles 12-14, and Recitals 58 and
              60-62),
            </li>
            <li>
              the right to access personal data (GDPR Articles 12, 15 and
              Recitals 63, 64),
            </li>
            <li>
              the right to rectification including having inaccurate personal
              data completed if it is incomplete (GDPR Articles 5, 12, 16 and
              19),
            </li>
            <li>the right to erasure (GDPR Articles 18, 19 and Recital 67),</li>
            <li>the right to restrict processing (GDPR Article 18),</li>
            <li>
              the right to data portability (GDPR Article 20 and Recital 68),
            </li>
            <li>the right to object (GDPR Article 21).</li>
          </ul>
        </p>

        <Title level={4} id="thirteen">
          13 Right to lodge a complaint with a supervisory authority
        </Title>
        <p>
          The VRE DPO and its service providers will make every reasonable
          effort to address your data protection concerns. However, you have a
          right to lodge a complaint with a data protection authority. Contact
          information for the European Data Protection Board and EU DPAs is
          available here:
        </p>
        <p>
          <a href="http://ec.europa.eu/newsroom/article29/item-detail.cfm?item_id=612080">
            http://ec.europa.eu/newsroom/article29/item-detail.cfm?item_id=612080
          </a>
          <br></br>
          <a href="https://edpb.europa.eu/about-edpb/board/members_en">
            https://edpb.europa.eu/about-edpb/board/members_en
          </a>
        </p>
        <p>
          Contact information for the Swiss Data Protection authority is
          available here:
          <br></br>
          <a href="https://www.edoeb.admin.ch/edoeb/en/home.html">
            https://www.edoeb.admin.ch/edoeb/en/home.html
          </a>
        </p>
        <p>
          Contact information for the Israeli Data Protection authority is
          available here:
          <br></br>
          <a href="https://www.gov.il/en/Departments/the_privacy_protection_authority">
            https://www.gov.il/en/Departments/the_privacy_protection_authority
          </a>
        </p>
        <p>
          Contact information for the Norwegian Data Protection authority is
          available here:
          <br></br>
          <a href="https://www.datatilsynet.no/en/about-us/">
            https://www.datatilsynet.no/en/about-us/
          </a>
        </p>
        <p>
          Contact information for the Turkish Data Protection authority is
          available here:
          <a href="https://kvkk.gov.tr/ ">https://kvkk.gov.tr/ </a>
        </p>

        {/* <Checkbox checked={true} disabled={true}>
          Strictly necessary cookies
        </Checkbox> */}
        <br />
        <br />
      </div>
    </Modal>
  );
}

export default TermsOfUseModal;
