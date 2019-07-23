import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";

import Card from "components/Card/Card.jsx";

class Reporteria extends Component {
  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card title="Ventas" content={<p>wens</p>} />
              <Card title="Compras" content={<p>wens</p>} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Reporteria;
