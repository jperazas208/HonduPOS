import React from "react";
import { BrowserRouter, Switch, Route, NavLink } from "react-router-dom";
import Pos from "./Views/Pos";
import Error404 from "./Views/Error404";
import Home from "./Views/Home";
import { Icon, Menu, Segment, Sidebar } from "semantic-ui-react";
import "./Styles/App.css";
class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <div class="icon-bar">
            <NavLink className="item" exact to="/">
              <Menu.Item as="a">
                <Icon name="home" />
                Home
              </Menu.Item>
            </NavLink>
            <NavLink className="item" to="/reports">
              <Menu.Item as="a">
                <Icon name="line graph" />
                Reporteria
              </Menu.Item>
            </NavLink>
            <NavLink className="item" to="/pos">
              <Menu.Item as="a">
                <Icon name="money" />
                Ventas
              </Menu.Item>
            </NavLink>
            <NavLink className="item" to="/inventario">
              <Menu.Item as="a">
                <Icon name="edit outline" />
                Inventario
              </Menu.Item>
            </NavLink>
            <NavLink className="item" to="/empresa">
              <Menu.Item as="a">
                <Icon name="file" />
                Empresa
              </Menu.Item>
            </NavLink>
          </div>
          <div className="site-content">
            <Switch>
              <Route path="/" component={Home} exact />
              <Route path="/POS" component={Pos} />
              <Route component={Error404} />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default Dashboard;
