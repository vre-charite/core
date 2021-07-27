import React from 'react';
import { Collapse } from 'antd';
import { useTranslation } from 'react-i18next';

const { Panel } = Collapse;

function SupportCollapse(props) {
  const { t } = useTranslation('support');

  const callback = (v) => {
    console.log(v);
  };

  return (
    <>
      <p id="account">
        <strong>{t('drawers.0.title')}</strong>
      </p>
      <Collapse onChange={callback}>
        <Panel header={t('drawers.0.panel.0.question')} key="1">
          <p>{t('drawers.0.panel.0.answer')}</p>
        </Panel>
        <Panel header={t('drawers.0.panel.1.question')} key="2">
          <p>{t('drawers.0.panel.1.answer')}</p>
        </Panel>
        <Panel header={t('drawers.0.panel.2.question')} key="3" id="3">
          <p>{t('drawers.0.panel.2.answer')}</p>
        </Panel>
      </Collapse>
      <br />
      <p id="projects">
        <strong>{t('drawers.1.title')}</strong>
      </p>
      <Collapse onChange={callback}>
        <Panel header={t('drawers.1.panel.0.question')} key="4">
          <p>{t('drawers.1.panel.0.answer')}</p>
          <ul>
            <li>
              <strong>Administrator</strong>:{' '}
              {t('drawers.1.panel.0.Administrator')}
            </li>
            <li>
              <strong>Collaborator</strong>:{' '}
              {t('drawers.1.panel.0.Collaborator')}
            </li>
            <li>
              <strong>Contributor</strong>: {t('drawers.1.panel.0.Contributor')}
            </li>
          </ul>
        </Panel>
        <Panel header={t('drawers.1.panel.1.question')} key="5">
          <p>{t('drawers.1.panel.1.answer')}</p>
        </Panel>
        <Panel header={t('drawers.1.panel.2.question')} key="6">
          <p>{t('drawers.1.panel.2.answer')}</p>
        </Panel>
        <Panel header={t('drawers.1.panel.3.question')} key="7">
          <p>{t('drawers.1.panel.3.answer')}</p>
          <p>{t('drawers.1.panel.3.visibility')}</p>
        </Panel>
        <Panel header={t('drawers.1.panel.4.question')} key="8">
          <p>{t('drawers.1.panel.4.answer')}</p>
        </Panel>
      </Collapse>
      <br />
      <p id="security">
        <strong>{t('drawers.2.title')}</strong>
      </p>
      <Collapse onChange={callback}>
        <Panel header={t('drawers.2.panel.0.question')} key="10">
          <p>{t('drawers.2.panel.0.answer')}</p>
        </Panel>
      </Collapse>
      <br />
      <p id="file">
        <strong>{t('drawers.3.title')}</strong>
      </p>
      <Collapse>
        <Panel header={t('drawers.3.panel.0.question')} key="11">
          <p>{t('drawers.3.panel.0.answer')}</p>
        </Panel>
        <Panel header={t('drawers.3.panel.1.question')} key="12">
          <p>{t('drawers.3.panel.1.answer')}</p>
        </Panel>
        <Panel header={t('drawers.3.panel.2.question')} key="13">
          <p>{t('drawers.3.panel.2.answer')}</p>
        </Panel>
        <Panel header={t('drawers.3.panel.3.question')} key="14">
          <p>{t('drawers.3.panel.3.answer')}</p>
        </Panel>
      </Collapse>
      <br />
      <p id="file-organization">
        <strong>{t('drawers.4.title')}</strong>
      </p>
      <Collapse>
        <Panel header={t('drawers.4.panel.0.question')} key="15">
          <p>{t('drawers.4.panel.0.answer')}</p>
        </Panel>
        <Panel header={t('drawers.4.panel.1.question')} key="16">
          <p>{t('drawers.4.panel.1.answer')}</p>
        </Panel>
        <Panel header={t('drawers.4.panel.2.question')} key="17">
          <p>{t('drawers.4.panel.2.answer')}</p>
        </Panel>
        <Panel header={t('drawers.4.panel.3.question')} key="18">
          <p>{t('drawers.4.panel.3.answer')}</p>
        </Panel>
        <Panel
          header={t('drawers.4.panel.4.question')}
          key="file-organization.4"
        >
          <p>{t('drawers.4.panel.4.answer')}</p>
        </Panel>
      </Collapse>
      <br />
      <p id="external-project-tools">
        <strong>{t('drawers.5.title')}</strong>
      </p>
      <Collapse>
        {t('drawers.5.panel', { returnObjects: true })?.map((panel) => {
          return (
            <Panel header={panel.question} key={panel.question}>
              <p>{panel.answer}</p>
            </Panel>
          );
        })}
      </Collapse>
    </>
  );
}

export default SupportCollapse;
