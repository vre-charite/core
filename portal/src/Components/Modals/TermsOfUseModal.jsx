import React from 'react';
import { Button, Checkbox, message, Modal } from 'antd';

function TermsOfUseModal(props) {
  return (
    <Modal
      title="Platform Terms of Use Agreement"
      visible={props.visible}
      onOk={props.handleOk}
      onCancel={props.handleCancel}
      width={'70%'}
    >
      <p>Data Protection Statement</p>
      <p>
        Thank you for your interest in our company. Data protection is of the
        utmost importance to Charité – Universitätsmedizin Berlin. It is
        generally possible to use our website without having to provide any
        personal data. However, if a data subject wishes to use our website to
        access specific services offered by our company, the processing of
        personal data may become necessary. If it is necessary to process
        personal data, and there is no legal basis for such processing, we will
        generally obtain the data subject’s consent.
      </p>
      <p>
        The processing of personal data, such as a data subject's name, address,
        email address or telephone number, shall always be performed in
        accordance with the General Data Protection Regulation (“GDPR”) and in
        compliance with the country-specific data protection regulations
        applicable to Charité – Universitätsmedizin Berlin. The aim of our
        organization’s data protection statement is to inform the general public
        of the nature, scope and purpose of the personal data we collect, use
        and process. This data protection statement also informs data subjects
        of the rights to which they are entitled.
      </p>
      <p>
        As the data controller, Charité – Universitätsmedizin Berlin has
        implemented numerous technical and organizational measures to ensure
        that personal data processed via this website enjoy the most
        comprehensive protection possible. However, due to some of the security
        vulnerabilities inherent in data transfer via the internet, complete
        protection cannot be guaranteed. For this reason, data subjects are free
        to choose alternative means (e.g. via telephone) by which to transfer
        their personal data.
      </p>
    </Modal>
  );
}

export default TermsOfUseModal;
