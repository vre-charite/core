import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
import ReactDOM from 'react-dom';
import G6 from '@antv/g6';
import moment from 'moment';
import { timeConvert } from '../../../../../Utility';

const { Title } = Typography;

export default function (props) {
  const ref = React.useRef(null);
  let graph = null;

  const record = props.record;

  const lineage = record?.lineage;
  const guidEntityMap = lineage && lineage?.guidEntityMap;
  const relations = lineage && lineage?.relations;
  const nodeKeys = guidEntityMap ? Object.keys(guidEntityMap) : [];

  const nodes = [];
  const edges = [];

  if (relations) {
    for (const item of relations) {
      edges.push({
        source: item.fromEntityId,
        target: item.toEntityId,
        style: {
          lineWidth: '2',
          endArrow: {
            path: G6.Arrow.triangle(13, 13, 0),
            fill: '#32C5FF',
          },
          stroke: '#32C5FF',
        },
      });
    }
  }

  const nodeList = [];

  for (let i = 0; i < nodeKeys.length; i++) {
    const key = nodeKeys[i];
    const nodeInfo = guidEntityMap[key];
    let displayText = nodeInfo.displayText;
    const attributes = nodeInfo.attributes;


    let label = null;
    let createdTime =
      attributes &&
      attributes.createTime &&
      moment(attributes.createTime * 1000).format('YYYY-MM-DD HH:mm:ss');
    

    let textArr = displayText.split('/');
    label = textArr && textArr.length > 1 && textArr[textArr.length - 1];

    if (nodeInfo.typeName === 'Process') {
      textArr = displayText.split(':');
      label = textArr && textArr.length > 1 && textArr[1];

      let time = null;

      if ( textArr && textArr.length > 6) {
        time = `${textArr[2]}:${textArr[3]}:${textArr[4]}`;
        createdTime = timeConvert(time, 'datetime');
      } else if (textArr && textArr.length <= 6) {
        time = textArr[2]
        let date = new Date(time * 1000);
        console.log(date)
        createdTime = moment(time * 1000).format('YYYY-MM-DD HH:mm:ss');
      }
    }

    const isPipeline = nodeInfo.typeName === 'Process';

    nodeList.push({
      id: nodeInfo.guid,
      label,
      size: 40,
      icon: {
        show: true,
        img: '/vre/file.svg',
        width: 12,
      },
      style: {
        fill: '#E2F6FF',
        stroke: '#E2F6FF',
      },
      y: 40,
      isPipeline,
      createdTime,
      typeName: nodeInfo.typeName,
    });
  }

  let flowList = ['nfs_file', 'Process', 'nfs_file_processed'];

  if (!props.type) flowList = ['nfs_file'];

  for (const flow of flowList) {
    const flowNode = nodeList.find((el) => el.typeName === flow);

    if (flowNode) {
      nodes.push({
        ...flowNode,
        x: 50 + nodes.length * 200,
      });
    }
  }

  const data = {
    nodes,
    edges,
  };

  const tooltip = new G6.Tooltip({
    offsetX: 0,
    offsetY: 0,
    itemTypes: ['node'],
    getContent: (e) => {
      const outDiv = document.createElement('div');
      outDiv.style.width = '220px';
      //outDiv.style.padding = '0px 0px 20px 0px';
      outDiv.innerHTML = `
				<h4>${e.item.getModel().isPipeline ? 'Pipeline Info' : 'Node Info'}</h4>
				<ul style="padding-left:20px">
          <li>Type: ${e.item.getModel().typeName}</li>
          <li>Name: ${e.item.getModel().label}</li>
          <li>Process Time: ${e.item.getModel().createdTime}</li>
				</ul>
				`;
      return outDiv;
    },
  });

  const toolbar = new G6.ToolBar({
    className: 'g6-toolbar-ul',
    getContent: () => {
      return `
      <ul>
        <li code='center'>Fit view</li>
      </ul>
    `;
    },
    handleClick: (code, graph) => {
      if (code === 'center') {
        graph.fitCenter();
      }
    },
  });

  /**
   * This demo shows how to custom a behavior to allow drag and zoom canvas with two fingers on touchpad and wheel
   * By Shiwu
   */
  G6.registerBehavior('double-finger-drag-canvas', {
    getEvents: function getEvents() {
      return {
        wheel: 'onWheel',
      };
    },

    onWheel: function onWheel(ev) {
      if (ev.ctrlKey) {
        const canvas = graph.get('canvas');
        const point = canvas.getPointByClient(ev.clientX, ev.clientY);
        let ratio = graph.getZoom();
        if (ev.wheelDelta > 0) {
          ratio = ratio + ratio * 0.05;
        } else {
          ratio = ratio - ratio * 0.05;
        }
        graph.zoomTo(ratio, {
          x: point.x,
          y: point.y,
        });
      } else {
        const x = ev.deltaX || ev.movementX;
        const y = ev.deltaY || ev.movementY;
        graph.translate(-x, -y);
      }
      ev.preventDefault();
    },
  });

  useEffect(() => {
    data.nodes.forEach((node, i) => {
      if (node.isPipeline) {
        node.icon.img = '/vre/path.svg';
        node.style.fill = '#FCE698';
        node.style.stroke = '#FCE698';
        node.size = 30;
      }
      if (node.typeName === 'nfs_file_processed') {
        node.style.fill = '#43B7EA';
        node.style.stroke = '#43B7EA';
        node.icon.img = '/vre/file-white.svg';
      }
    });

    if (!graph) {
      graph = new G6.Graph({
        container: ReactDOM.findDOMNode(ref.current),
        width: props.width ? props.width : 280,
        height: 500,
        plugins: [tooltip, toolbar],
        fitCenter: true,
        defaultNode: {
          labelCfg: {
            position: 'bottom',
            style: {
              opacity: 0,
            },
          },
        },
        defaultEdge: {
          labelCfg: {
            autoRotate: true,
            refY: 20,
          },
        },
        layout: {
          type: 'dagre', // Layout type
          rankdir: 'TB', // 'TB' / 'BT' / 'LR' / 'RL' => T: top; B: bottom; L: left; R: right
        },
        modes: {
          default: ['double-finger-drag-canvas'],
        },
      });
    }
    if (nodes.length > 0) {
      graph.data(data);
      graph.render();
    }

    //Destroy the graph before unmount
    return () => {
      graph.destroy();
    };
  }, [record]);

  return (
    <>
      {/* <Title level={5}>Data Lineage Graph</Title> */}
      <div ref={ref}></div>
    </>
  );
}
