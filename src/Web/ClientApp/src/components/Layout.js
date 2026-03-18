import React, { Component } from 'react';
import { NavMenu } from './NavMenu';
import { AdminNotifications } from './AdminNotifications';

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
      <div className="app-container">
        <NavMenu />
        <AdminNotifications />
        <main className="main-content">
          {this.props.children}
        </main>
      </div>
    );
  }
}
