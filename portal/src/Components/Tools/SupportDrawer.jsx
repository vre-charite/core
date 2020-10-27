import React, { useState } from 'react';
import { Button, Drawer, Collapse, Divider, Typography, Anchor } from 'antd';
import { SwapOutlined, PauseOutlined } from '@ant-design/icons';
import SupportCollapse from './SupportCollapse';
import ContactUsForm from './ContactUsForm';
import { useEffect } from 'react';

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;
const { Link } = Anchor;

function SupportDrawer(props) {
  const [placement, setPlacement] = useState('right');
  const [width, setWidth] = useState(400);

  useEffect(() => {
    function handleResize() {
      if (width > window.innerWidth) setWidth(window.innerWidth);
      props.onClose();
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [width]);

  function swapPosition() {
    if (placement === 'left') {
      setPlacement('right');
    } else {
      setPlacement('left');
    }
  }
  function mouseDown(e) {
    console.log('mouseDown', e);
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
    console.log('stepMove');
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

  return (
    <Drawer
      title="Support"
      placement={placement}
      closable={false}
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
      <Anchor affix={false}>
        <Link href="#user-guide" title="User Guide" />
        <Link href="#faq" title="FAQ">
          <Link href="#account" title="Account Information" />
          <Link href="#projects" title="Projects" />
          <Link href="#security" title="Site security" />
          <Link href="#file" title="File upload" />
        </Link>
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

      {/* <Collapse border={false}>
        <Panel header="Recommended resources" key="a">
          <p>
            Download the User Guide (pdf) to learn more about the VRE platform
            services, tools and workflows.​
          </p>
          <Button type="primary" ghost>
            <a
              href="/vre/files/VRE User Manual 2020-10-20.pdf"
              download
              target="_self"
            >
              {' '}
              Download Guide
            </a>
          </Button>
        </Panel>
        <Panel header="Frequently asked questions" key="b">
          <SupportCollapse />
        </Panel>
        <Panel header="Still need help?" key="c">
          <Title level={4}>Still need help?</Title>
          <Paragraph>
            ontact the VRE Support Team for additional help with platform tools
            and services, to report a bug, or other general questions.​
          </Paragraph>
          <ContactUsForm />
        </Panel>
      </Collapse> */}

      <Title level={4} id="user-guide">
        User Guide
      </Title>
      <p>
        Download the User Guide (pdf) to learn more about the VRE platform
        services, tools and workflows.​
      </p>
      <Button type="primary" ghost>
        <a
          href="/vre/files/VRE User Manual 2020-10-20.pdf"
          download
          target="_self"
        >
          {' '}
          Download Guide
        </a>
      </Button>
      <Divider />
      <Title level={4} id="faq">
        Frequently asked questions
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
