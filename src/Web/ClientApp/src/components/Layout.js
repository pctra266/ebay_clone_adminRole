import React, { Component } from 'react';
import { NavMenu } from './NavMenu';

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
      <div className="app-container">
        <NavMenu />
        <main className="main-content">
          {this.props.children}
        </main>
      </div>
    );
  }
}
