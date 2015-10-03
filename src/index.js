'use strict'

import React, { Component, PropTypes } from 'react/addons'
import classnames from 'classnames'


const CSSTransitionGroup = React.addons.CSSTransitionGroup;
const TAB = 9;
const SPACEBAR = 32;
const ALIGNMENTS = ['center', 'right', 'left'];
const MENU_SIZES = ['sm', 'md', 'lg', 'xl'];

class DropdownMenu extends Component {
  constructor(props) {
    super(props);

    this._lastWindowClickEvent = null;
  }

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    toggle: PropTypes.node.isRequired,
    inverse: PropTypes.bool,
    align: PropTypes.oneOf(ALIGNMENTS),
    animAlign: PropTypes.oneOf(ALIGNMENTS),
    textAlign: PropTypes.oneOf(ALIGNMENTS),
    menuAlign: PropTypes.oneOf(ALIGNMENTS),
    className: PropTypes.string,
    size: PropTypes.oneOf(MENU_SIZES),
    upwards: PropTypes.bool,
  }

  static defaultProps = {
    inverse: false,
    align: 'center',
    animAlign: null,
    textAlign: null,
    menuAlign: null,
    className: null,
    size: null,
    upwards: false,
  }

  componentDidUpdate(prevProps, prevState) {
    const menuItems = React.findDOMNode(this.refs.menuItems);
    if(this.props.isOpen && !prevProps.isOpen) {
      this._lastWindowClickEvent = this.handleClickOutside;

      document.addEventListener('click', this._lastWindowClickEvent);
      menuItems.addEventListener('click', this.props.close);
      menuItems.addEventListener('onkeydown', this.close);
    } else if(!this.props.isOpen && prevProps.isOpen) {
      document.removeEventListener('click', this._lastWindowClickEvent);
      menuItems.removeEventListener('click', this.props.close);
      menuItems.removeEventListener('onkeydown', this.close);

      this._lastWindowClickEvent = null;
    }
  }

  componentWillUnmount() {
    if(this._lastWindowClickEvent) {
      document.removeEventListener('click', this._lastWindowClickEvent);
    }
  }

  close = (e) => {
    const key = e.which || e.keyCode;
    if(key === SPACEBAR) {
      this.props.close();
      e.preventDefault();
    }
  }
  
  handleClickOutside = (e) => {
    const node = React.findDOMNode(this);
    let target = e.target;

    while(target.parentNode) {
      if(target === node) {
        return;
      }

      target = target.parentNode;
    }

    this.props.close(e);
  }

  handleKeyDown = (e) => {
    const key = e.which || e.keyCode;
    if(key !== TAB) {
      return;
    }

    const items = React.findDOMNode(this).querySelectorAll('button,a');
    const id = e.shiftKey ? 1 : items.length - 1;
    
    if(e.target == items[id]) {
      this.props.close(e);
    }
  }


  render() {
    const { isOpen, toggle, className, inverse, align, animAlign, textAlign, menuAlign, children, size, upwards } = this.props ;

    const menuClassName = classnames(
      'dd-menu',
      `dd-menu-${menuAlign || align}`,
      { 'dd-menu-inverse': inverse },
      className,
      size ? ('dd-menu-' + size) : null
    );

    const listClassName = 'dd-items-' + (textAlign || align);
    const transitionProps = {
      transitionName: 'grow-from-' + (upwards ? 'up-' : '') + (animAlign || align),
      component: 'div',
      className: classnames('dd-menu-items', { 'dd-items-upwards': upwards }),
      onKeyDown: this.handleKeyDown,
      ref: 'menuItems',
    };

    return (
      <div className={menuClassName}>
        {toggle}
        <CSSTransitionGroup {...transitionProps}>
          {isOpen && <ul className={listClassName}>{children}</ul>}
        </CSSTransitionGroup>
      </div>
    );
  }
}

module.exports = DropdownMenu;


class NestedDropdownMenu extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
    this._closeCallback = null;
  }

  static propTypes = {
    toggle: PropTypes.node.isRequired,
    nested: PropTypes.oneOf(['inherit', 'reverse', 'left', 'right']),
    animate: PropTypes.bool,
    direction: PropTypes.oneOf(['left', 'right']),
    upwards: PropTypes.bool,
    delay: PropTypes.number,
  }

  static defaultProps = {
    nested: 'reverse',
    animate: false,
    direction: 'right',
    upwards: false,
    delay: 500,
  }

  open = () => {
    if(this._closeCallback) {
      clearTimeout(this._closeCallback);
      this._closeCallback = null;
    }
    this.setState({ isOpen: true });
  }

  close = () => {
    this._closeCallback = setTimeout(_ => {
      this.setState({ isOpen: false });
    }.bind(this), this.props.delay);
  }

  render() {
    const { toggle, children, nested, animate, direction, upwards } = this.props;
    const { isOpen } = this.state;

    const itemProps = {
      className: classnames('nested-dd-menu', `nested-${nested}`),
      onMouseOver: this.open,
      onMouseLeave: this.close,
      onFocus: this.open,
      onBlur: this.close,
    };

    const prefix = upwards ? 'up-' : '';
    const transitionProps = {
      className: 'dd-item-ignore',
      transitionEnter: animate,
      transitionLeave: animate,
      transitionName: `grow-from-${prefix}${direction}`,
    };

    return (
      <li {...itemProps}>
        {toggle}
        <CSSTransitionGroup {...transitionProps}>
          {isOpen ? <ul key="items">{children}</ul> : null}
        </CSSTransitionGroup>
      </li>
    );
  }
}

module.exports.NestedDropdownMenu = NestedDropdownMenu;
