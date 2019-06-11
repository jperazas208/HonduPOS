import React, { Component } from "react";
import { Grid, Card, Image } from "semantic-ui-react";

class PosProduct extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Grid.Column width={3}>
        <Card style={{ height: "100%" }}>
          <Image
            src={"https://robohash.org/" + this.props.product.id_producto}
            wrapped
            ui={false}
          />
          <Card.Content>
            <Card.Header>{this.props.product.nombre}</Card.Header>
            <Card.Meta>L. {this.props.product.precio.toFixed(2)}</Card.Meta>
          </Card.Content>
        </Card>
      </Grid.Column>
    );
  }
}

export default PosProduct;
