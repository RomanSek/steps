'use strict';

var React = require('react');

var Steps = React.createClass({
  _previousStepsWidth: 0,
  _itemsWidth: [],
  getInitialState() {
    return {
      init: false,
      tailWidth: 0
    };
  },
  getDefaultProps() {
    return {
      prefixCls: 'rc-steps',
      iconPrefix: 'rc',
      maxDescriptionWidth: 120,
      direction: '',
      current: 0
    };
  },
  componentDidMount() {
    if (this.props.direction === 'vertical') {
      return;
    }
    var $dom = React.findDOMNode(this);
    var len = $dom.children.length - 1;
    var $frame =  $dom.children[0];
    var i;
    this._itemsWidth = new Array(len);
    for (i = 0; i < len - 1; i++) {
      var $item = $dom.children[i + 1].children;
      this._itemsWidth[i] = Math.ceil($item[0].offsetWidth + $item[1].children[0].offsetWidth);
    }
    this._itemsWidth[i] = Math.ceil($dom.children[len].offsetWidth);
    this._previousStepsWidth = Math.floor(React.findDOMNode(this).offsetWidth);
    this._update();

    /*
     * 下面的代码是为了兼容window系统下滚动条出现后会占用宽度的问题。
     */
    var me = this;
    var eventMethod = window.attachEvent ? 'attachEvent' : 'addEventListener';
    if ($frame.contentWindow) {
      addResize();
    } else {
      $frame[eventMethod]('load', addResize);
    }
    function addResize() {
      $frame.contentWindow.onresize = function() {
        me._resize();
      };
    }
  },
  componentWillUnmount() {
    if (this.props.direction === 'vertical') {
      return;
    }
    if (window.attachEvent) {
      window.detachEvent('onresize', this._resize);
    } else {
      window.removeEventListener('resize', this._resize);
    }
  },
  componentDidUpdate() {
    this._resize();
  },
  _resize() {
    var w = Math.floor(React.findDOMNode(this).offsetWidth);
    if (this._previousStepsWidth === w) {
      return;
    }
    this._previousStepsWidth = w;
    this._update();
  },
  _update() {
    var len = this.props.children.length - 1;
    var tw = 0;
    this._itemsWidth.forEach(function (w) {
      tw += w;
    });
    var dw = Math.floor((this._previousStepsWidth - tw) / len) - 1;
    if (dw <= 0) {
      return;
    }
    this.setState({
      init: true,
      tailWidth: dw
    });
  },
  render() {
    var props = this.props;
    var prefixCls = props.prefixCls;
    var children = props.children;
    var maxDescriptionWidth = props.maxDescriptionWidth;
    var iconPrefix = props.iconPrefix;
    var len = children.length - 1;
    var iws = this._itemsWidth;
    var clsName = prefixCls;
    clsName += props.size === 'small' ? ' ' + prefixCls + '-small' : '';
    clsName += props.direction === 'vertical' ? ' ' + prefixCls + '-vertical' : '';

    return (
      <div className={clsName}>
        {props.direction !== 'vertical' ? <iframe refs='resizeFrame' className={prefixCls + '-resize-frame'}></iframe> : ''}
        {children.map(function (ele, idx) {
          var np = {
            stepNumber: (idx + 1).toString(),
            stepLast: idx === len,
            tailWidth: iws.length === 0 || idx === len ? 'auto' : iws[idx] + this.state.tailWidth,
            prefixCls: prefixCls,
            iconPrefix: iconPrefix,
            maxDescriptionWidth: maxDescriptionWidth
          };
          if (!ele.props.status) {
            np.status = idx === props.current ? 'process' : (idx < props.current ? 'finish' : 'wait');
          }
          return React.cloneElement(ele, np);
        }, this)}
      </div>
    );
  }
});

module.exports = Steps;