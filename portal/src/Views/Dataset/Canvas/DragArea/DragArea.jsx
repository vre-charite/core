import React from 'react';
import PropTypes from 'prop-types';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './dragArea.scss';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default class DragArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentBreakpoint: 'lg',
      compactType: 'vertical',
      mounted: false,
      layouts: this.props.layout,
    };
  }

  componentDidMount() {
    this.setState({ mounted: true });
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1000);
  }

  onBreakpointChange = (breakpoint) => {
    this.setState({
      currentBreakpoint: breakpoint,
    });
  };

  onCompactTypeChange = () => {
    const { compactType: oldCompactType } = this.state;
    const compactType =
      oldCompactType === 'horizontal'
        ? 'vertical'
        : oldCompactType === 'vertical'
        ? null
        : 'horizontal';
    this.setState({ compactType });
  };

  loadLocal = () => {
    this.setState({
      layouts: {
        lg: JSON.parse(localStorage.getItem('layout')),
      },
    });
  };

  render() {
    return (
      <div style={{ marginTop: '35px', minWidth: '100%' }}>
        {this.state.layouts ? (
          <ResponsiveReactGridLayout
            {...this.props}
            style={{
              marginTop: 10,
            }}
            layouts={this.state.layouts}
            onBreakpointChange={this.onBreakpointChange}
            draggableHandle={'.dragarea'}
            measureBeforeMount={true}
            compactType={this.state.compactType}
            verticalCompact={true}
            preventCollision={!this.state.compactType}
          >
            {this.props.children}
          </ResponsiveReactGridLayout>
        ) : null}
      </div>
    );
  }
}

DragArea.propTypes = {
  onLayoutChange: PropTypes.func.isRequired,
};

DragArea.defaultProps = {
  rowHeight: 100,
  onLayoutChange: function () {},
  cols: { lg: 24, md: 24, sm: 12, xs: 3, xxs: 3 },
};
