import React, { useState } from 'react';
import { Button, Drawer, Divider, Typography, Anchor } from 'antd';
import { SwapOutlined, PauseOutlined } from '@ant-design/icons';
import SupportCollapse from './SupportCollapse';
import ContactUsForm from './ContactUsForm';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';
import { xwikis } from '../../externalLinks';

const { Title } = Typography;
const { Link } = Anchor;

function SupportDrawer(props) {
  const [placement, setPlacement] = useState('right');
  const [width, setWidth] = useState(400);
  const { t } = useTranslation('support');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    function handleResize() {
      if (width > window.innerWidth) setWidth(window.innerWidth);
      props.onClose();
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line
  }, [width]);

  function swapPosition() {
    if (placement === 'left') {
      setPlacement('right');
    } else {
      setPlacement('left');
    }
  }
  function mouseDown(e) {
    document.addEventListener('mousemove', mouseMove, true);
    document.addEventListener('mouseup', stopMove, true);
  }
  /**
   * Set the panel width based on mouse position and placement of the panel
   *
   * @param {*} e
   */
  function mouseMove(e) {
    const windowWidth = window.innerWidth;
    const mouseX = e.clientX;
    let panelWidth;
    if (placement === 'right') {
      panelWidth = Math.min(windowWidth - mouseX, windowWidth - 20);
    } else {
      panelWidth = Math.min(mouseX, windowWidth - 20);
    }
    const minWidth = 280; // Set a minimal width to panel
    panelWidth = Math.max(panelWidth, minWidth);

    setWidth(panelWidth);
  }

  function stopMove() {
    document.removeEventListener('mousemove', mouseMove, true);
    document.removeEventListener('mouseup', stopMove, true);
  }

  /**
   * Get the position for the rezise button
   * Depends on the placement of the drawer and drawer width
   * The button is positioned relative to the drawer
   */
  function getPosition() {
    if (placement === 'right') {
      return width - 32;
    } else {
      return -14;
    }
  }

  const rightArrow = (
    <svg
      onClick={() => {
        setIsOpen((state) => !state);
      }}
      viewBox="0 0 1024 1024"
      focusable="false"
      data-icon="caret-right"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      /* style={{
        position: 'absolute',
        top: 38,
        cursor: 'pointer',
        transform: `rotate(${isOpen ? 90 : 0}deg)`,
      }} */
      className={styles.arrow + ' ' + (isOpen && styles.active)}
    >
      <path d="M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37z"></path>
    </svg>
  );

  return (
    <Drawer
      title="Support"
      id="support-drawer"
      placement={placement}
      onClose={props.onClose}
      visible={props.visible}
      mask={false}
      closable={true}
      width={width}
      bodyStyle={
        {
          // paddingBottom: '157px',
          // overflowY: 'scroll',
          // maxHeight: 'calc(100vh - 55px - 137px)',
        }
      }
    >
      <Title level={4} id="toc">
        Contents
      </Title>
      <Anchor
        style={{ position: 'relative', overflow: 'hidden' }}
        getContainer={() => {
          return document.querySelector('#support-drawer');
        }}
        affix={false}
      >
        <Link href="#user-guide" title="User Guide" />
        {rightArrow}
        <div style={{ paddingLeft: 15 }}>
          <Link href="#faq" title="FAQ">
            <div className={styles.subHeader + ' ' + (isOpen && styles.active)}>
              <Link href="#account" title="Account Information" />
              <Link href="#projects" title="Projects" />
              <Link href="#security" title="Site security" />
              <Link href="#file" title="File upload" />
              <Link href="#file-organization" title={t('drawers.4.title')} />
              <Link
                href="#external-project-tools"
                title={t('drawers.5.title')}
              />
            </div>
          </Link>
        </div>
        <Link href="#contact-us" title="Contact Us" />
      </Anchor>
      <br />
      <Button
        onMouseDown={mouseDown}
        type="link"
        style={{
          position: 'absolute',
          top: '50%',
          right: `${getPosition()}px`,
          transform: 'translateY(-50%)',
          zIndex: '99',
          transition: 'none',
          cursor: 'ew-resize',
        }}
      >
        <PauseOutlined />
      </Button>
      <Button
        type={'link'}
        onClick={swapPosition}
        style={{ position: 'absolute', top: '12px', right: '40px' }}
      >
        <SwapOutlined />
      </Button>
      <Title level={4} id="user-guide">
        {t('userguide')}
      </Title>
      <p>{t('userguide_content')}</p>

      <Button type="primary" ghost>
        <a
          href={xwikis.documentation}
          target="_blank"
        >
          {t('download_guide_button_text')}
        </a>
      </Button>
      <Divider />
      <Title level={4} id="faq">
        {t('faq_title')}
      </Title>
      <SupportCollapse />
      {/* <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '400px',
          textAlign: 'center',
          padding: '0 20px 20px',
        }}
      >
        <Divider
          style={{ marginLeft: '-20px', marginRight: '-20px', width: '400px' }}
        />
        <p>Still need help?</p>
        <Button type="primary" block>
          <Link to="/support">Contact Us</Link>
        </Button>
      </div> */}
      <Divider />
      <ContactUsForm />
    </Drawer>
  );
}

export default SupportDrawer;
